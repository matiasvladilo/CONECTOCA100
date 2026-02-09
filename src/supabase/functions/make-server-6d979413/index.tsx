import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Validate required environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
  console.error('❌ CRITICAL: Missing required environment variables');
  console.error('SUPABASE_URL:', SUPABASE_URL ? '✓ Set' : '✗ Missing');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✓ Set' : '✗ Missing');
  console.error('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing');
}

console.log('✓ Environment variables validated');
console.log('✓ Server starting...');

// Create Supabase client for admin operations (using SERVICE_ROLE_KEY)
const supabaseAdmin = createClient(
  SUPABASE_URL ?? '',
  SUPABASE_SERVICE_ROLE_KEY ?? '',
);

// Create Supabase client for token verification (using ANON_KEY)
const supabaseAuth = createClient(
  SUPABASE_URL ?? '',
  SUPABASE_ANON_KEY ?? '',
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Helper function to verify user authentication
async function verifyAuth(authHeader: string | null) {
  if (!authHeader) {
    console.log('❌ Auth failed: No authorization header');
    return { error: 'No authorization header', userId: null };
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    console.log('❌ Auth failed: Invalid authorization header format');
    return { error: 'Invalid authorization header format', userId: null };
  }

  const token = parts[1];
  if (!token || token.length < 20) {
    console.log('❌ Auth failed: Invalid token');
    return { error: 'Invalid token', userId: null };
  }

  try {
    // Use getUser with the user's JWT token
    // IMPORTANT: Use supabaseAuth (with ANON_KEY) to verify user tokens, not supabaseAdmin
    console.log(`🔍 Verifying token (length: ${token.length}, first 20 chars: ${token.substring(0, 20)}...)`);
    const { data: { user }, error } = await supabaseAuth.auth.getUser(token);

    if (error) {
      console.log(`❌ Auth failed: ${error.message}`, error);
      return { error: `Invalid JWT: ${error.message}`, userId: null };
    }

    if (!user) {
      console.log('❌ Auth failed: No user found');
      return { error: 'User not found', userId: null };
    }

    console.log(`✓ Auth successful: User ${user.id} (${user.email})`);
    return { error: null, userId: user.id, user };
  } catch (err) {
    console.error('❌ Auth exception:', err);
    return { error: 'Authentication error', userId: null };
  }
}

// Health check endpoint
app.get("/make-server-6d979413/health", (c) => {
  return c.json({ status: "ok" });
});

// AUTH ROUTES

// Password recovery - Send reset email
app.post("/make-server-6d979413/auth/reset-password", async (c) => {
  try {
    const { email } = await c.req.json();

    if (!email) {
      return c.json({ error: 'Email es requerido' }, 400);
    }

    console.log(`🔑 Password reset requested for: ${email}`);

    // Send password reset email using Supabase Auth
    const { data, error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify`,
    });

    if (error) {
      console.log(`❌ Error sending password reset email: ${error.message}`);

      // Don't reveal if email exists or not for security
      // Return success message anyway
      return c.json({
        success: true,
        message: 'Si el correo existe en nuestro sistema, recibirás un enlace de recuperación'
      });
    }

    console.log(`✅ Password reset email sent successfully to: ${email}`);

    return c.json({
      success: true,
      message: 'Se ha enviado un enlace de recuperación a tu correo'
    });

  } catch (err: any) {
    console.error('❌ Password reset exception:', err);

    // Return generic success message for security
    return c.json({
      success: true,
      message: 'Si el correo existe en nuestro sistema, recibirás un enlace de recuperación'
    });
  }
});

// Sign up new user
app.post("/make-server-6d979413/signup", async (c) => {
  try {
    const { email, password, name, role, businessAction, businessCode, businessName } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: 'Email, password y nombre son requeridos' }, 400);
    }

    // Validate business action
    if (!businessAction || !['create', 'join'].includes(businessAction)) {
      return c.json({ error: 'Debes seleccionar crear o unirte a un negocio' }, 400);
    }

    let businessId = '';
    let business = null;

    // Handle business logic
    if (businessAction === 'create') {
      // Create new business
      if (!businessName || businessName.trim().length < 3) {
        return c.json({ error: 'El nombre del negocio debe tener al menos 3 caracteres' }, 400);
      }

      // Use DEMOCODE for demo business, random for others
      const inviteCode = businessName.includes('Demo') && businessName.includes('Oca')
        ? 'DEMOCODE'
        : Math.random().toString(36).substring(2, 10).toUpperCase();

      // Special handling for demo business: check if it already exists
      if (inviteCode === 'DEMOCODE') {
        const allBusinesses = await kv.getByPrefix('business:');
        const existingDemoBusiness = allBusinesses.find((b: any) => b.inviteCode === 'DEMOCODE');

        if (existingDemoBusiness) {
          // Demo business already exists, reuse it
          business = existingDemoBusiness;
          businessId = existingDemoBusiness.id;
          console.log(`🔄 Reusing existing demo business: ${business.name} (ID: ${businessId})`);
        } else {
          // Create new demo business and save it immediately
          businessId = crypto.randomUUID();
          business = {
            id: businessId,
            name: businessName.trim(),
            inviteCode,
            ownerId: 'PENDING', // Temporary, will be updated after user creation
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          // Save business immediately so other users can join
          await kv.set(`business:${businessId}`, business);
          console.log(`📝 Demo business saved immediately: ${businessName} (ID: ${businessId}, Code: ${inviteCode})`);
        }
      } else {
        // Create regular business
        businessId = crypto.randomUUID();
        business = {
          id: businessId,
          name: businessName.trim(),
          inviteCode,
          ownerId: '', // Will be set after user creation
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        console.log(`📝 Creating new business: ${businessName} (ID: ${businessId}, Code: ${inviteCode})`);
      }

    } else if (businessAction === 'join') {
      // Join existing business
      if (!businessCode || businessCode.trim().length === 0) {
        return c.json({ error: 'Debes proporcionar un código de invitación' }, 400);
      }

      // Find business by invite code
      const allBusinesses = await kv.getByPrefix('business:');
      business = allBusinesses.find((b: any) => b.inviteCode === businessCode.trim().toUpperCase());

      if (!business) {
        return c.json({ error: 'Código de invitación inválido' }, 404);
      }

      businessId = business.id;
      console.log(`🔗 User joining existing business: ${business.name} (ID: ${businessId})`);
    }

    // Determine user role: admin if creating business, otherwise use provided role or default to 'user'
    const userRole = businessAction === 'create' ? 'admin' : (role || 'user');

    if (businessAction === 'create') {
      console.log(`👑 Creating business owner with admin role for: ${email}`);
    }

    console.log(`📝 Creating user with metadata:`, { name, role: userRole, businessId, businessAction });

    // Create user with Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role: userRole, businessId },
      // Automatically confirm the user's email since an email server hasn't been configured
      email_confirm: true
    });

    if (error) {
      console.log(`Error creating user during signup: ${error.message}`);

      // Handle specific errors
      if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        return c.json({ error: 'Este email ya está registrado. Por favor inicia sesión.' }, 400);
      }

      return c.json({ error: error.message }, 400);
    }

    if (!data.user) {
      return c.json({ error: 'Error al crear usuario' }, 500);
    }

    // If creating new business, set the owner and save it
    if (businessAction === 'create' && business) {
      // Update owner if not set, empty, or PENDING
      if (!business.ownerId || business.ownerId === '' || business.ownerId === 'PENDING') {
        business.ownerId = data.user.id;
        await kv.set(`business:${businessId}`, business);
        console.log(`✓ Business owner updated to ${data.user.id}`);
      } else {
        // Business already has a real owner, just log
        console.log(`✓ User ${data.user.id} associated with existing business ${businessId}`);
      }
    }

    // Store user profile in KV store
    const userProfile = {
      id: data.user.id,
      name,
      email,
      role: userRole,
      businessId,
      notificationPrefs: {
        orderStatus: true,
        production: false
      },
      createdAt: new Date().toISOString()
    };

    await kv.set(`user:${data.user.id}`, userProfile);

    console.log(`✓ User ${email} created and associated with business ${businessId}`)
    console.log(`📋 User profile saved:`, JSON.stringify(userProfile, null, 2));

    return c.json({
      success: true,
      user: {
        id: data.user.id,
        email,
        name,
        role: userRole,
        businessId
      },
      business: {
        id: businessId,
        name: business.name,
        inviteCode: business.inviteCode
      }
    });
  } catch (error) {
    console.log(`Error in signup route: ${error}`);
    return c.json({ error: 'Error interno del servidor' }, 500);
  }
});

// USER PROFILE ROUTES

// Get user profile
app.get("/make-server-6d979413/profile", async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId, user } = await verifyAuth(authHeader);

  if (error) {
    return c.json({ error }, 401);
  }

  try {
    let profile = await kv.get(`user:${userId}`);

    console.log(`👤 GET /profile - User: ${userId}`);

    // If profile doesn't exist, create it from user metadata
    if (!profile && user) {
      console.log(`⚠️ Profile not found, creating from metadata for user ${userId}`);
      profile = {
        id: userId,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario',
        email: user.email || '',
        role: user.user_metadata?.role || 'local',
        businessId: user.user_metadata?.businessId || '',
        notificationPrefs: {
          orderStatus: true,
          production: false
        },
        createdAt: new Date().toISOString()
      };

      await kv.set(`user:${userId}`, profile);
      console.log(`✓ Profile created for user ${userId} with role: ${profile.role}, businessId: ${profile.businessId}`);
    } else if (profile) {
      console.log(`✓ Profile found - Role: ${profile.role}, BusinessId: ${profile.businessId}`);
    }

    if (!profile) {
      console.log(`❌ No se pudo crear el perfil para user ${userId}`);
      return c.json({ error: 'No se pudo crear el perfil' }, 500);
    }

    return c.json(profile);
  } catch (error) {
    console.log(`Error getting profile: ${error}`);
    return c.json({ error: 'Error al obtener perfil' }, 500);
  }
});

// Update user profile
app.put("/make-server-6d979413/profile", async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    return c.json({ error }, 401);
  }

  try {
    const updates = await c.req.json();
    const currentProfile = await kv.get(`user:${userId}`);

    if (!currentProfile) {
      return c.json({ error: 'Perfil no encontrado' }, 404);
    }

    const updatedProfile = {
      ...currentProfile,
      ...updates,
      id: userId, // ensure ID doesn't change
      email: currentProfile.email, // ensure email doesn't change
    };

    await kv.set(`user:${userId}`, updatedProfile);

    return c.json(updatedProfile);
  } catch (error) {
    console.log(`Error updating profile: ${error}`);
    return c.json({ error: 'Error al actualizar perfil' }, 500);
  }
});

// ============================================
// BUSINESS (NEGOCIO) ROUTES
// ============================================

// Get business information
app.get("/make-server-6d979413/business", async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    return c.json({ error }, 401);
  }

  try {
    const userProfile = await kv.get(`user:${userId}`);

    if (!userProfile || !userProfile.businessId) {
      return c.json({ error: 'Usuario no asociado a ningún negocio' }, 404);
    }

    const business = await kv.get(`business:${userProfile.businessId}`);

    if (!business) {
      return c.json({ error: 'Negocio no encontrado' }, 404);
    }

    // Don't expose invite code to non-owners
    const isOwner = business.ownerId === userId;
    const businessData = {
      id: business.id,
      name: business.name,
      inviteCode: isOwner ? business.inviteCode : undefined,
      isOwner,
      createdAt: business.createdAt
    };

    return c.json({ data: businessData });
  } catch (error) {
    console.error('Error getting business:', error);
    return c.json({ error: 'Error al obtener información del negocio' }, 500);
  }
});

// Regenerate business invite code (owner only)
app.post("/make-server-6d979413/business/regenerate-code", async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    return c.json({ error }, 401);
  }

  try {
    const userProfile = await kv.get(`user:${userId}`);

    if (!userProfile || !userProfile.businessId) {
      return c.json({ error: 'Usuario no asociado a ningún negocio' }, 404);
    }

    const business = await kv.get(`business:${userProfile.businessId}`);

    if (!business) {
      return c.json({ error: 'Negocio no encontrado' }, 404);
    }

    // Verify user is the owner
    if (business.ownerId !== userId) {
      return c.json({ error: 'Solo el propietario puede regenerar el código' }, 403);
    }

    // Generate new invite code
    const newInviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    business.inviteCode = newInviteCode;
    business.updatedAt = new Date().toISOString();

    await kv.set(`business:${business.id}`, business);

    console.log(`✓ Invite code regenerated for business ${business.name}: ${newInviteCode}`);

    return c.json({
      data: {
        inviteCode: newInviteCode
      }
    });
  } catch (error) {
    console.error('Error regenerating invite code:', error);
    return c.json({ error: 'Error al regenerar código de invitación' }, 500);
  }
});

// Get business members (owner and admins only)
app.get("/make-server-6d979413/business/members", async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    return c.json({ error }, 401);
  }

  try {
    const userProfile = await kv.get(`user:${userId}`);

    if (!userProfile || !userProfile.businessId) {
      return c.json({ error: 'Usuario no asociado a ningún negocio' }, 404);
    }

    const business = await kv.get(`business:${userProfile.businessId}`);

    if (!business) {
      return c.json({ error: 'Negocio no encontrado' }, 404);
    }

    // Get all users in the business
    const allUsers = await kv.getByPrefix('user:');
    const businessMembers = allUsers
      .filter((u: any) => u.businessId === userProfile.businessId)
      .map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt
      }));

    return c.json({
      data: {
        business: {
          id: business.id,
          name: business.name
        },
        members: businessMembers,
        totalMembers: businessMembers.length
      }
    });
  } catch (error) {
    console.error('Error getting business members:', error);
    return c.json({ error: 'Error al obtener miembros del negocio' }, 500);
  }
});

// PRODUCT ROUTES

// Get all products (with pagination support) - filtered by business
app.get("/make-server-6d979413/products", async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    return c.json({ error }, 401);
  }

  try {
    // Get user's businessId
    const userProfile = await kv.get(`user:${userId}`);

    console.log(`📦 GET /products - User: ${userId}, Role: ${userProfile?.role}, BusinessId: ${userProfile?.businessId}`);

    if (!userProfile || !userProfile.businessId) {
      console.log(`❌ User not associated with business`);
      return c.json({ error: 'Usuario no asociado a ningún negocio' }, 404);
    }

    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '1000');
    const offset = (page - 1) * limit;

    const allProducts = await kv.getByPrefix('product:');
    console.log(`📦 Total products in database: ${allProducts.length}`);

    // Filter by businessId
    const businessProducts = (allProducts || []).filter((p: any) => p.businessId === userProfile.businessId);
    console.log(`📦 Products for business ${userProfile.businessId}: ${businessProducts.length}`);

    // Log sample of products for debugging
    if (businessProducts.length > 0) {
      console.log(`📦 Sample product:`, JSON.stringify(businessProducts[0], null, 2));
    }

    // Sort by creation date (newest first)
    businessProducts.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    // Apply pagination
    const paginatedProducts = businessProducts.slice(offset, offset + limit);
    console.log(`📦 Returning ${paginatedProducts.length} products (page ${page}, limit ${limit})`);

    return c.json({
      data: paginatedProducts,
      pagination: {
        page,
        limit,
        total: businessProducts.length,
        totalPages: Math.ceil(businessProducts.length / limit),
        hasNext: offset + limit < businessProducts.length,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error(`❌ Error getting products:`, error);
    return c.json({ error: 'Error al obtener productos' }, 500);
  }
});

// Create new product
app.post("/make-server-6d979413/products", async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    return c.json({ error }, 401);
  }

  try {
    // Get user's businessId
    const userProfile = await kv.get(`user:${userId}`);

    console.log(`➕ POST /products - User: ${userId}, Role: ${userProfile?.role}, BusinessId: ${userProfile?.businessId}`);

    if (!userProfile || !userProfile.businessId) {
      console.log(`❌ User not associated with business`);
      return c.json({ error: 'Usuario no asociado a ningún negocio' }, 404);
    }

    const body = await c.req.json();
    const {
      name,
      description,
      price,
      image,
      imageUrl,
      stock,
      category,
      categoryId,
      productionAreaId,
      ingredients
    } = body;

    if (!name || price === undefined || price === null) {
      return c.json({ error: 'Nombre y precio son requeridos' }, 400);
    }

    const productId = crypto.randomUUID();
    const product = {
      id: productId,
      name,
      description: description || '',
      price: parseFloat(price),
      image: image || imageUrl || '',
      imageUrl: imageUrl || image || '',
      stock: stock !== undefined ? parseInt(stock) : 100,
      category: category || 'General',
      categoryId: categoryId || null,
      productionAreaId: productionAreaId || null,
      ingredients: ingredients !== undefined ? ingredients : [],
      businessId: userProfile.businessId,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log(`➕ Creating product "${name}" with ${product.ingredients.length} ingredients`);

    await kv.set(`product:${productId}`, product);

    // Also save product-ingredient relationships for backend consistency
    if (ingredients && Array.isArray(ingredients)) {
      for (const ingredient of ingredients) {
        const relationId = crypto.randomUUID();
        await kv.set(`product-ingredient:${productId}:${ingredient.ingredientId}`, {
          id: relationId,
          productId,
          ingredientId: ingredient.ingredientId,
          quantity: ingredient.quantity,
          createdAt: new Date().toISOString()
        });
      }
    }

    // Verify it was saved correctly
    const savedProduct = await kv.get(`product:${productId}`);
    console.log(`✓ Product saved and verified: ${name} for business ${userProfile.businessId}`);
    console.log(`✓ Ingredients in saved product: ${savedProduct?.ingredients?.length || 0}`);

    return c.json({ data: product });
  } catch (error) {
    console.log(`Error creating product: ${error}`);
    return c.json({ error: 'Error al crear producto' }, 500);
  }
});

// Update product
app.put("/make-server-6d979413/products/:id", async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    return c.json({ error }, 401);
  }

  try {
    const productId = c.req.param('id');
    const updates = await c.req.json();

    // Get user's businessId to verify access
    const userProfile = await kv.get(`user:${userId}`);
    if (!userProfile || !userProfile.businessId) {
      return c.json({ error: 'Usuario no asociado a ningún negocio' }, 404);
    }

    const currentProduct = await kv.get(`product:${productId}`);

    if (!currentProduct) {
      return c.json({ error: 'Producto no encontrado' }, 404);
    }

    // Verify product belongs to user's business
    if (currentProduct.businessId !== userProfile.businessId) {
      return c.json({ error: 'No tienes permiso para actualizar este producto' }, 403);
    }

    // Handle imageUrl field mapping
    if (updates.imageUrl && !updates.image) {
      updates.image = updates.imageUrl;
    }

    const { ingredients } = updates;

    const updatedProduct = {
      ...currentProduct,
      ...updates,
      id: productId, // ensure ID doesn't change
      businessId: currentProduct.businessId, // ensure businessId doesn't change
      createdBy: currentProduct.createdBy, // ensure createdBy doesn't change
      createdAt: currentProduct.createdAt, // ensure createdAt doesn't change
      ingredients: ingredients !== undefined ? ingredients : (currentProduct.ingredients || []),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`product:${productId}`, updatedProduct);

    // Update product-ingredient relationships for backend consistency
    if (ingredients !== undefined && Array.isArray(ingredients)) {
      // Delete existing relationships first
      const existingRelations = await kv.getByPrefix(`product-ingredient:${productId}:`);
      for (const relation of existingRelations) {
        await kv.del(`product-ingredient:${productId}:${relation.ingredientId}`);
      }

      // Create new ones
      for (const ingredient of ingredients) {
        const relationId = crypto.randomUUID();
        await kv.set(`product-ingredient:${productId}:${ingredient.ingredientId}`, {
          id: relationId,
          productId,
          ingredientId: ingredient.ingredientId,
          quantity: ingredient.quantity,
          createdAt: new Date().toISOString()
        });
      }
    }

    console.log(`✓ Product updated: ${updatedProduct.name} for business ${userProfile.businessId} with ${ingredients?.length || 0} ingredients`);

    return c.json({ data: updatedProduct });
  } catch (error) {
    console.log(`Error updating product: ${error}`);
    return c.json({ error: 'Error al actualizar producto' }, 500);
  }
});

// Delete product
app.delete("/make-server-6d979413/products/:id", async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    return c.json({ error }, 401);
  }

  try {
    const productId = c.req.param('id');

    // Get user's businessId to verify access
    const userProfile = await kv.get(`user:${userId}`);
    if (!userProfile || !userProfile.businessId) {
      return c.json({ error: 'Usuario no asociado a ningún negocio' }, 404);
    }

    const currentProduct = await kv.get(`product:${productId}`);

    if (!currentProduct) {
      return c.json({ error: 'Producto no encontrado' }, 404);
    }

    // Verify product belongs to user's business
    if (currentProduct.businessId !== userProfile.businessId) {
      return c.json({ error: 'No tienes permiso para eliminar este producto' }, 403);
    }

    await kv.del(`product:${productId}`);

    console.log(`✓ Product deleted: ${currentProduct.name} from business ${userProfile.businessId}`);

    return c.json({ data: { deleted: true } });
  } catch (error) {
    console.log(`Error deleting product: ${error}`);
    return c.json({ error: 'Error al eliminar producto' }, 500);
  }
});

// ====================================
// PRODUCT INGREDIENTS ROUTES
// ====================================

// Get ingredients for a specific product
app.get('/make-server-6d979413/products/:id/ingredients', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    return c.json({ error }, 401);
  }

  try {
    const productId = c.req.param('id');

    // Get product to verify it exists
    const product = await kv.get(`product:${productId}`);
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }

    // Get ingredients from product-ingredient relationships
    let relations = await kv.getByPrefix(`product-ingredient:${productId}:`);

    // Fallback: If no relations found, check if product has ingredients array (legacy support)
    if ((!relations || relations.length === 0) && product.ingredients && Array.isArray(product.ingredients) && product.ingredients.length > 0) {
      console.log(`⚠️ No product-ingredient relations found for ${productId}, using legacy 'ingredients' array with ${product.ingredients.length} items`);
      relations = product.ingredients.map((pi: any) => ({
        id: pi.id || crypto.randomUUID(),
        productId: productId,
        ingredientId: pi.ingredientId,
        quantity: pi.quantity,
        createdAt: product.createdAt
      }));
    }

    // Get ingredient details
    const productIngredients = await Promise.all(
      relations.map(async (relation: any) => {
        const ingredient = await kv.get(`ingredient:${relation.ingredientId}`);
        return {
          id: relation.id,
          productId: productId,
          productName: product.name,
          ingredientId: relation.ingredientId,
          ingredientName: ingredient?.name || 'Unknown',
          quantity: relation.quantity,
          unit: ingredient?.unit || '',
          costPerUnit: ingredient?.costPerUnit || 0
        };
      })
    );

    console.log(`✓ Retrieved ${productIngredients.length} ingredients for product ${product.name} (${productId})`);
    return c.json({ data: productIngredients });
  } catch (error) {
    console.error('Error getting product ingredients:', error);
    return c.json({ error: 'Failed to get product ingredients' }, 500);
  }
});

// Set/Replace all ingredients for a product (PUT)
app.put('/make-server-6d979413/products/:id/ingredients', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    return c.json({ error }, 401);
  }

  try {
    // Verify user is admin
    const userProfile = await kv.get(`user:${userId}`);
    if (userProfile?.role !== 'admin') {
      return c.json({ error: 'Unauthorized: Admin access required' }, 403);
    }

    const productId = c.req.param('id');
    const body = await c.req.json();
    const { ingredients } = body;

    // Verify product exists
    const product = await kv.get(`product:${productId}`);
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }

    // Delete existing relationships
    const existingRelations = await kv.getByPrefix(`product-ingredient:${productId}:`);
    for (const relation of existingRelations) {
      await kv.del(`product-ingredient:${productId}:${relation.ingredientId}`);
    }

    // Create new relationships
    const productIngredients = [];
    const ingredientsListForProduct = [];

    if (ingredients && Array.isArray(ingredients)) {
      for (const ingredient of ingredients) {
        const relationId = crypto.randomUUID();
        const relation = {
          id: relationId,
          productId,
          ingredientId: ingredient.ingredientId,
          quantity: ingredient.quantity,
          createdAt: new Date().toISOString()
        };

        await kv.set(`product-ingredient:${productId}:${ingredient.ingredientId}`, relation);

        // Add to list for updating product object
        ingredientsListForProduct.push({
          ingredientId: ingredient.ingredientId,
          quantity: ingredient.quantity
        });

        // Get ingredient details for response
        const ingredientData = await kv.get(`ingredient:${ingredient.ingredientId}`);
        productIngredients.push({
          id: relationId,
          productId: productId,
          productName: product.name,
          ingredientId: ingredient.ingredientId,
          ingredientName: ingredientData?.name || 'Unknown',
          quantity: ingredient.quantity,
          unit: ingredientData?.unit || '',
          costPerUnit: ingredientData?.costPerUnit || 0
        });
      }
    }

    // CRITICAL: Update the product object itself to keep sync
    const updatedProduct = {
      ...product,
      ingredients: ingredientsListForProduct,
      updatedAt: new Date().toISOString()
    };
    await kv.set(`product:${productId}`, updatedProduct);
    console.log(`✓ Product object updated with ${ingredientsListForProduct.length} ingredients`);

    console.log(`✓ Product ingredients updated for product ${productId}: ${ingredients?.length || 0} ingredients`);
    return c.json({ data: productIngredients });
  } catch (error) {
    console.error('Error updating product ingredients:', error);
    return c.json({ error: 'Failed to update product ingredients' }, 500);
  }
});

// Add a single ingredient to a product (POST)
app.post('/make-server-6d979413/products/:id/ingredients', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    return c.json({ error }, 401);
  }

  try {
    // Verify user is admin
    const userProfile = await kv.get(`user:${userId}`);
    if (userProfile?.role !== 'admin') {
      return c.json({ error: 'Unauthorized: Admin access required' }, 403);
    }

    const productId = c.req.param('id');
    const body = await c.req.json();
    const { ingredientId, quantity } = body;

    if (!ingredientId || !quantity || quantity <= 0) {
      return c.json({ error: 'ingredientId and quantity are required' }, 400);
    }

    // Verify product exists
    const product = await kv.get(`product:${productId}`);
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }

    // Verify ingredient exists
    const ingredient = await kv.get(`ingredient:${ingredientId}`);
    if (!ingredient) {
      return c.json({ error: 'Ingredient not found' }, 404);
    }

    // Create relationship
    const relationId = crypto.randomUUID();
    const relation = {
      id: relationId,
      productId,
      ingredientId,
      quantity,
      createdAt: new Date().toISOString()
    };

    await kv.set(`product-ingredient:${productId}:${ingredientId}`, relation);

    // CRITICAL: Update the product object itself to keep sync
    const currentIngredients = product.ingredients || [];
    // Remove existing if present (update logic)
    const otherIngredients = currentIngredients.filter((i: any) => i.ingredientId !== ingredientId);
    otherIngredients.push({ ingredientId, quantity });

    const updatedProduct = {
      ...product,
      ingredients: otherIngredients,
      updatedAt: new Date().toISOString()
    };
    await kv.set(`product:${productId}`, updatedProduct);

    const productIngredient = {
      id: relationId,
      productId: productId,
      productName: product.name,
      ingredientId,
      ingredientName: ingredient.name,
      quantity,
      unit: ingredient.unit,
      costPerUnit: ingredient.costPerUnit || 0
    };

    console.log(`✓ Ingredient ${ingredient.name} added to product ${product.name} (${productId})`);
    return c.json({ data: productIngredient }, 201);
  } catch (error) {
    console.error('Error adding ingredient to product:', error);
    return c.json({ error: 'Failed to add ingredient to product' }, 500);
  }
});

// Remove an ingredient from a product (DELETE)
app.delete('/make-server-6d979413/products/:productId/ingredients/:ingredientId', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    return c.json({ error }, 401);
  }

  try {
    // Verify user is admin
    const userProfile = await kv.get(`user:${userId}`);
    if (userProfile?.role !== 'admin') {
      return c.json({ error: 'Unauthorized: Admin access required' }, 403);
    }

    const productId = c.req.param('productId');
    const ingredientId = c.req.param('ingredientId');

    // Verify relationship exists
    const relation = await kv.get(`product-ingredient:${productId}:${ingredientId}`);
    if (!relation) {
      return c.json({ error: 'Product-ingredient relationship not found' }, 404);
    }

    // Delete relationship
    await kv.del(`product-ingredient:${productId}:${ingredientId}`);

    // CRITICAL: Update the product object itself to keep sync
    const product = await kv.get(`product:${productId}`);
    if (product) {
      const currentIngredients = product.ingredients || [];
      const updatedIngredients = currentIngredients.filter((i: any) => i.ingredientId !== ingredientId);

      const updatedProduct = {
        ...product,
        ingredients: updatedIngredients,
        updatedAt: new Date().toISOString()
      };
      await kv.set(`product:${productId}`, updatedProduct);
    }

    console.log(`✓ Ingredient ${ingredientId} removed from product ${productId}`);
    return c.json({ data: { deleted: true } });
  } catch (error) {
    console.error('Error removing ingredient from product:', error);
    return c.json({ error: 'Failed to remove ingredient from product' }, 500);
  }
});

// Upload product image
app.post("/make-server-6d979413/upload-product-image", async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    return c.json({ error }, 401);
  }

  try {
    console.log('📸 Starting product image upload...');

    const userProfile = await kv.get(`user:${userId}`);

    if (!userProfile || !userProfile.businessId) {
      return c.json({ error: 'Usuario no asociado a ningún negocio' }, 404);
    }

    // Get form data
    const formData = await c.req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return c.json({ error: 'No se proporcionó ningún archivo' }, 400);
    }

    console.log(`📸 File received: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return c.json({ error: 'El archivo debe ser una imagen' }, 400);
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return c.json({ error: 'La imagen no debe superar los 5MB' }, 400);
    }

    // Create bucket name
    const bucketName = `make-6d979413-products`;

    // Check if bucket exists, create if not
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);

    if (!bucketExists) {
      console.log(`📦 Creating storage bucket: ${bucketName}`);
      const { error: createError } = await supabaseAdmin.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: 5242880 // 5MB
      });

      if (createError) {
        console.error('❌ Error creating bucket:', createError);
        return c.json({ error: 'Error al crear el bucket de almacenamiento' }, 500);
      }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userProfile.businessId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    console.log(`📤 Uploading to: ${bucketName}/${fileName}`);

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Error uploading file:', uploadError);
      return c.json({ error: `Error al subir la imagen: ${uploadError.message}` }, 500);
    }

    console.log(`✓ File uploaded successfully: ${uploadData.path}`);

    // Create signed URL (valid for 1 year)
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
      .from(bucketName)
      .createSignedUrl(fileName, 31536000); // 1 year

    if (signedUrlError) {
      console.error('❌ Error creating signed URL:', signedUrlError);
      return c.json({ error: 'Error al crear la URL de la imagen' }, 500);
    }

    console.log(`✓ Signed URL created successfully`);

    return c.json({
      url: signedUrlData.signedUrl,
      path: uploadData.path
    });
  } catch (error) {
    console.error('❌ Error in upload-product-image:', error);
    return c.json({ error: 'Error al subir la imagen' }, 500);
  }
});

// ORDER ROUTES

// Get orders for current user (with pagination support)
app.get("/make-server-6d979413/orders", async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    return c.json({ error }, 401);
  }

  try {
    console.log(`📦 GET /orders - User: ${userId}`);
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '10');
    const offset = (page - 1) * limit;

    const userProfile = await kv.get(`user:${userId}`);
    console.log(`👤 User profile:`, userProfile ? `${userProfile.name} (${userProfile.role})` : 'Not found');

    if (!userProfile || !userProfile.businessId) {
      console.error(`❌ User ${userId} not associated with any business`);
      return c.json({ error: 'Usuario no asociado a ningún negocio' }, 404);
    }

    // If user is production, dispatch, or admin role, get all orders FROM THEIR BUSINESS
    if (userProfile?.role === 'production' || userProfile?.role === 'dispatch' || userProfile?.role === 'admin') {
      console.log(`🏭 Loading all orders for business: ${userProfile.businessId}`);
      const allOrders = await kv.getByPrefix('order:');
      console.log(`📋 Total orders in system: ${allOrders?.length || 0}`);

      // Filter by businessId
      const businessOrders = (allOrders || []).filter((order: any) => order.businessId === userProfile.businessId);
      console.log(`📋 Orders for this business: ${businessOrders.length}`);

      // Enrich orders with customer data
      const enrichedOrders = await Promise.all(businessOrders.map(async (order: any) => {
        try {
          const customerProfile = await kv.get(`user:${order.userId}`);

          // Enrich products with production area data
          let enrichedProducts = order.products;
          if (order.products && Array.isArray(order.products)) {
            enrichedProducts = await Promise.all(order.products.map(async (product: any) => {
              try {
                // If product already has area data, return as is
                if (product.productionAreaId) {
                  return product;
                }

                // Get product details to find production area
                const productDetails = await kv.get(`product:${product.productId}`);
                if (productDetails?.productionAreaId) {
                  // Get production area details
                  const productionArea = await kv.get(`production-area:${productDetails.productionAreaId}`);
                  return {
                    ...product,
                    productionAreaId: productDetails.productionAreaId,
                    productionAreaName: productionArea?.name || 'Sin área',
                    productionAreaColor: productionArea?.color || '#6b7280',
                    productionAreaIcon: productionArea?.icon || 'Package'
                  };
                }

                return product;
              } catch (productError) {
                console.error(`Error enriching product ${product.productId}:`, productError);
                return product; // Return product as-is if enrichment fails
              }
            }));
          }

          return {
            ...order,
            deliveryAddress: customerProfile?.address || order.deliveryAddress || 'Sin dirección registrada',
            customerName: customerProfile?.name || order.customerName || 'Cliente',
            products: enrichedProducts
          };
        } catch (orderError) {
          console.error(`Error enriching order ${order.id}:`, orderError);
          // Return order with minimal enrichment if error occurs
          return {
            ...order,
            deliveryAddress: order.deliveryAddress || 'Sin dirección registrada',
            customerName: order.customerName || 'Cliente'
          };
        }
      }));

      // Sort by creation date (newest first)
      enrichedOrders.sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });

      // Apply pagination
      const paginatedOrders = enrichedOrders.slice(offset, offset + limit);

      return c.json({
        data: paginatedOrders,
        pagination: {
          page,
          limit,
          total: enrichedOrders.length,
          totalPages: Math.ceil(enrichedOrders.length / limit),
          hasNext: offset + limit < enrichedOrders.length,
          hasPrev: page > 1
        }
      });
    }

    // Otherwise, get only user's orders FROM THEIR BUSINESS
    console.log(`👤 Loading orders for user: ${userId}`);
    const allOrders = await kv.getByPrefix('order:');
    const userOrders = (allOrders || []).filter((order: any) =>
      order.userId === userId && order.businessId === userProfile.businessId
    );
    console.log(`📋 Orders for this user: ${userOrders.length}`);

    // Enrich with current user's data and production area data
    const enrichedOrders = await Promise.all(userOrders.map(async (order: any) => {
      try {
        // Enrich products with production area data
        let enrichedProducts = order.products;
        if (order.products && Array.isArray(order.products)) {
          enrichedProducts = await Promise.all(order.products.map(async (product: any) => {
            try {
              // If product already has area data, return as is
              if (product.productionAreaId) {
                return {
                  ...product,
                  id: product.productId || product.id // Ensure id is set
                };
              }

              // Get product details to find production area
              const productDetails = await kv.get(`product:${product.productId}`);
              if (productDetails?.productionAreaId) {
                // Get production area details
                const productionArea = await kv.get(`production-area:${productDetails.productionAreaId}`);
                return {
                  ...product,
                  id: product.productId || product.id, // Ensure id is set
                  productionAreaId: productDetails.productionAreaId,
                  productionAreaName: productionArea?.name || 'Sin área',
                  productionAreaColor: productionArea?.color || '#6b7280',
                  productionAreaIcon: productionArea?.icon || 'Package'
                };
              }

              return {
                ...product,
                id: product.productId || product.id // Ensure id is set even if no area
              };
            } catch (productError) {
              console.error(`Error enriching product ${product.productId}:`, productError);
              return {
                ...product,
                id: product.productId || product.id // Ensure id is set even on error
              };
            }
          }));
        }

        return {
          ...order,
          deliveryAddress: userProfile?.address || order.deliveryAddress || 'Sin dirección registrada',
          customerName: userProfile?.name || order.customerName || 'Cliente',
          products: enrichedProducts
        };
      } catch (orderError) {
        console.error(`Error enriching order ${order.id}:`, orderError);
        // Return order with minimal enrichment if error occurs
        return {
          ...order,
          deliveryAddress: order.deliveryAddress || 'Sin dirección registrada',
          customerName: order.customerName || 'Cliente'
        };
      }
    }));

    // Sort by creation date (newest first)
    enrichedOrders.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    // Apply pagination
    const paginatedOrders = enrichedOrders.slice(offset, offset + limit);

    return c.json({
      data: paginatedOrders,
      pagination: {
        page,
        limit,
        total: enrichedOrders.length,
        totalPages: Math.ceil(enrichedOrders.length / limit),
        hasNext: offset + limit < enrichedOrders.length,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error(`❌ Error getting orders: ${error}`);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available');
    console.error('Error details:', error);
    return c.json({ error: 'Error al obtener pedidos', details: error instanceof Error ? error.message : String(error) }, 500);
  }
});

// Create new order
app.post("/make-server-6d979413/orders", async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    return c.json({ error }, 401);
  }

  try {
    // Get user's businessId
    const userProfile = await kv.get(`user:${userId}`);
    if (!userProfile || !userProfile.businessId) {
      return c.json({ error: 'Usuario no asociado a ningún negocio' }, 404);
    }

    const { products, deadline, total, notes } = await c.req.json();

    if (!products || !deadline) {
      return c.json({ error: 'Productos y fecha límite son requeridos' }, 400);
    }

    // Validate and update stock for each product
    for (const item of products) {
      const product = await kv.get(`product:${item.productId}`);

      if (!product) {
        console.log(`Product not found: ${item.productId} - ${item.name}`);
        return c.json({
          error: `Producto "${item.name}" no encontrado`
        }, 404);
      }

      // Verify product belongs to same business
      if (product.businessId !== userProfile.businessId) {
        return c.json({
          error: `Producto "${item.name}" no pertenece a tu negocio`
        }, 403);
      }

      const currentStock = product.stock ?? 0;

      if (currentStock < item.quantity) {
        console.log(`Insufficient stock for ${item.name}: Available ${currentStock}, Requested ${item.quantity}`);
        return c.json({
          error: `Stock insuficiente para "${item.name}". Disponible: ${currentStock}, Solicitado: ${item.quantity}`
        }, 400);
      }

      // Update product stock
      const newStock = currentStock - item.quantity;
      const updatedProduct = {
        ...product,
        stock: newStock,
        updatedAt: new Date().toISOString()
      };

      await kv.set(`product:${item.productId}`, updatedProduct);
      console.log(`Stock updated for ${item.name}: ${currentStock} -> ${newStock}`);
    }

    const orderId = crypto.randomUUID();

    // Enrich products with production area information
    const enrichedProducts = await Promise.all(
      products.map(async (item: any) => {
        const product = await kv.get(`product:${item.productId}`);
        return {
          ...item,
          id: item.productId, // Ensure id is set for analytics
          productionAreaId: product?.productionAreaId || null,
          areaStatus: 'pending' // Initial status for each area
        };
      })
    );

    // Calculate area statuses - group by productionAreaId
    const areaStatuses: Record<string, string> = {};
    enrichedProducts.forEach((item: any) => {
      if (item.productionAreaId) {
        // Initialize all areas to 'pending'
        if (!areaStatuses[item.productionAreaId]) {
          areaStatuses[item.productionAreaId] = 'pending';
        }
      }
    });

    const order = {
      id: orderId,
      userId,
      businessId: userProfile.businessId, // Associate with business
      products: enrichedProducts, // array with productionAreaId and areaStatus
      total: parseFloat(total),
      deadline,
      status: 'pending',
      progress: 0,
      notes: notes || '', // Add notes field
      areaStatuses, // Track status by production area
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deliveryAddress: userProfile?.address || 'Sin dirección registrada',
      customerName: userProfile?.name || 'Cliente'
    };

    await kv.set(`order:${orderId}`, order);

    console.log(`✓ Order created: ${orderId} for business ${userProfile.businessId}`);

    return c.json(order);
  } catch (error) {
    console.log(`Error creating order: ${error}`);
    return c.json({ error: 'Error al crear pedido' }, 500);
  }
});

// Update order details (general update)
app.put("/make-server-6d979413/orders/:id", async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    return c.json({ error }, 401);
  }

  try {
    const userProfile = await kv.get(`user:${userId}`);

    const orderId = c.req.param('id');
    const updates = await c.req.json();

    const currentOrder = await kv.get(`order:${orderId}`);

    if (!currentOrder) {
      return c.json({ error: 'Pedido no encontrado' }, 404);
    }

    // Check business permission
    if (currentOrder.businessId !== userProfile?.businessId) {
      return c.json({ error: 'No autorizado' }, 403);
    }

    // Allow staff roles to edit
    const allowedRoles = ['admin', 'production', 'dispatch', 'local'];
    if (!allowedRoles.includes(userProfile?.role) && currentOrder.userId !== userId) {
      return c.json({ error: 'No tienes permiso para editar este pedido' }, 403);
    }

    const { products, total, notes, deadline, customerName, deliveryAddress, status } = updates;

    const updatedOrder = {
      ...currentOrder,
      total: total !== undefined ? parseFloat(total) : currentOrder.total,
      notes: notes !== undefined ? notes : currentOrder.notes,
      deadline: deadline !== undefined ? deadline : currentOrder.deadline,
      customerName: customerName !== undefined ? customerName : currentOrder.customerName,
      deliveryAddress: deliveryAddress !== undefined ? deliveryAddress : currentOrder.deliveryAddress,
      updatedAt: new Date().toISOString()
    };

    // If status is updated directly (though usually it goes through /status endpoint)
    if (status) {
      updatedOrder.status = status;
    }

    // Logic to handle products update while preserving area info
    if (products && Array.isArray(products)) {
      const allProducts = await kv.getByPrefix('product:');

      const enrichedProducts = products.map((item: any) => {
        const productDef = allProducts.find((p: any) => p.id === item.productId);
        // Preserve existing area status if it's the same product
        const existingItem = currentOrder.products?.find((p: any) => p.productId === item.productId);

        return {
          ...item,
          productionAreaId: productDef?.productionAreaId || existingItem?.productionAreaId || null,
          areaStatus: existingItem?.areaStatus || 'pending'
        };
      });
      updatedOrder.products = enrichedProducts;

      // Also update areaStatuses map if new areas are introduced?
      // Simplification: keep existing areaStatuses, add new ones as pending?
      // For now, let's rely on the products array as the source of truth for areas.
    }

    await kv.set(`order:${orderId}`, updatedOrder);

    console.log(`✓ Order updated: ${orderId} by ${userId}`);
    return c.json(updatedOrder);

  } catch (error) {
    console.log(`Error updating order: ${error}`);
    return c.json({ error: 'Error al actualizar el pedido' }, 500);
  }
});

// Update order status (production and admin only)
app.put("/make-server-6d979413/orders/:id/status", async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    return c.json({ error }, 401);
  }

  try {
    const userProfile = await kv.get(`user:${userId}`);

    const orderId = c.req.param('id');
    const { status, progress } = await c.req.json();

    const userRole = userProfile?.role;
    const isPowerUser = userRole === 'production' || userRole === 'dispatch' || userRole === 'admin';
    const isLocalDelivering = (userRole === 'local' || userRole === 'user') && (status === 'entregado' || status === 'delivered');

    if (!isPowerUser && !isLocalDelivering) {
      return c.json({ error: 'No autorizado' }, 403);
    }

    const currentOrder = await kv.get(`order:${orderId}`);

    if (!currentOrder) {
      return c.json({ error: 'Pedido no encontrado' }, 404);
    }

    const updatedOrder = {
      ...currentOrder,
      status: status || currentOrder.status,
      progress: progress !== undefined ? progress : currentOrder.progress,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`order:${orderId}`, updatedOrder);

    return c.json(updatedOrder);
  } catch (error) {
    console.log(`Error updating order status: ${error}`);
    return c.json({ error: 'Error al actualizar estado del pedido' }, 500);
  }
});

// Update order area status (production and admin only)
app.put("/make-server-6d979413/orders/:id/area-status", async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    return c.json({ error }, 401);
  }

  try {
    const userProfile = await kv.get(`user:${userId}`);

    if (userProfile?.role !== 'production' && userProfile?.role !== 'dispatch' && userProfile?.role !== 'admin') {
      return c.json({ error: 'No autorizado' }, 403);
    }

    const orderId = c.req.param('id');
    const { areaId, status } = await c.req.json();

    if (!areaId || !status) {
      return c.json({ error: 'areaId y status son requeridos' }, 400);
    }

    const currentOrder = await kv.get(`order:${orderId}`);

    if (!currentOrder) {
      return c.json({ error: 'Pedido no encontrado' }, 404);
    }

    // Update area status
    const updatedAreaStatuses = {
      ...(currentOrder.areaStatuses || {}),
      [areaId]: status
    };

    // Update items that belong to this area
    const updatedProducts = (currentOrder.products || []).map((item: any) => {
      if (item.productionAreaId === areaId) {
        return { ...item, areaStatus: status };
      }
      return item;
    });

    // Calculate overall order status based on all area statuses
    const allAreaStatuses = Object.values(updatedAreaStatuses);
    let overallStatus = currentOrder.status;
    let overallProgress = currentOrder.progress;

    // If all areas are completed, mark order as completed
    if (allAreaStatuses.length > 0 && allAreaStatuses.every((s: any) => s === 'completed')) {
      overallStatus = 'completed';
      overallProgress = 100;
    }
    // If any area is in progress, mark order as in_progress
    else if (allAreaStatuses.some((s: any) => s === 'in_progress')) {
      overallStatus = 'in_progress';
      // Calculate progress as percentage of completed areas
      const completedAreas = allAreaStatuses.filter((s: any) => s === 'completed').length;
      overallProgress = Math.round((completedAreas / allAreaStatuses.length) * 100);
    }

    const updatedOrder = {
      ...currentOrder,
      products: updatedProducts,
      areaStatuses: updatedAreaStatuses,
      status: overallStatus,
      progress: overallProgress,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`order:${orderId}`, updatedOrder);

    console.log(`✓ Order ${orderId} area ${areaId} updated to ${status}`);
    return c.json(updatedOrder);
  } catch (error) {
    console.log(`Error updating order area status: ${error}`);
    return c.json({ error: 'Error al actualizar estado del área' }, 500);
  }
});

// Delete order
app.delete("/make-server-6d979413/orders/:id", async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    return c.json({ error }, 401);
  }

  try {
    const orderId = c.req.param('id');
    const order = await kv.get(`order:${orderId}`);

    if (!order) {
      return c.json({ error: 'Pedido no encontrado' }, 404);
    }

    const userProfile = await kv.get(`user:${userId}`);

    // Verify user has permission to delete this order (same business)
    if (!userProfile || !userProfile.businessId) {
      return c.json({ error: 'Usuario no asociado a ningún negocio' }, 404);
    }

    if (order.businessId !== userProfile.businessId) {
      return c.json({ error: 'No tienes permiso para eliminar este pedido' }, 403);
    }

    // Restore stock for each product in the order
    if (order.products && Array.isArray(order.products)) {
      for (const item of order.products) {
        const product = await kv.get(`product:${item.productId}`);

        if (product) {
          const currentStock = product.stock ?? 0;
          const restoredStock = currentStock + item.quantity;

          const updatedProduct = {
            ...product,
            stock: restoredStock,
            updatedAt: new Date().toISOString()
          };

          await kv.set(`product:${item.productId}`, updatedProduct);
          console.log(`Stock restored for ${item.name}: ${currentStock} -> ${restoredStock}`);
        }
      }
    }

    // Delete the order
    await kv.del(`order:${orderId}`);

    console.log(`🗑️ Order deleted: ${orderId} by user ${userId} (${userProfile.role})`);

    return c.json({
      success: true,
      message: 'Pedido eliminado correctamente'
    });
  } catch (error) {
    console.error(`Error deleting order: ${error}`);
    return c.json({ error: 'Error al eliminar pedido' }, 500);
  }
});

// Get single order
app.get("/make-server-6d979413/orders/:id", async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    return c.json({ error }, 401);
  }

  try {
    const orderId = c.req.param('id');
    const order = await kv.get(`order:${orderId}`);

    if (!order) {
      return c.json({ error: 'Pedido no encontrado' }, 404);
    }

    const userProfile = await kv.get(`user:${userId}`);

    // Check if user has permission to view this order
    if (order.userId !== userId && userProfile?.role !== 'production' && userProfile?.role !== 'dispatch' && userProfile?.role !== 'admin') {
      return c.json({ error: 'No autorizado' }, 403);
    }

    return c.json(order);
  } catch (error) {
    console.log(`Error getting order: ${error}`);
    return c.json({ error: 'Error al obtener pedido' }, 500);
  }
});

// ============================================
// NOTIFICATIONS ENDPOINTS
// ============================================

// Get notifications for a user
app.get('/make-server-6d979413/notifications', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    // Don't log error for missing sessions (expected during logout/before login)
    if (!error.includes('Auth session missing')) {
      console.error('Auth error in GET notifications:', error);
    }
    return c.json({ error }, 401);
  }

  try {
    const notifications = await kv.getByPrefix(`notification:${userId}:`);

    // Sort by createdAt DESC (most recent first)
    const sortedNotifications = notifications.sort((a: any, b: any) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return c.json({ data: sortedNotifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return c.json({ error: 'Failed to fetch notifications' }, 500);
  }
});

// Create a notification
app.post('/make-server-6d979413/notifications', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId: authUserId } = await verifyAuth(authHeader);

  if (error) {
    // Don't log error for missing sessions (expected during logout/before login)
    if (!error.includes('Auth session missing')) {
      console.error('Auth error in POST notifications:', error);
    }
    return c.json({ error }, 401);
  }

  try {
    const body = await c.req.json();
    const { title, message, type, orderId, targetUserId } = body;

    if (!title || !message || !type) {
      return c.json({ error: 'Missing required fields: title, message, type' }, 400);
    }

    const notificationId = crypto.randomUUID();
    const userId = targetUserId || authUserId; // Allow creating for other users (admin/production)

    const notification = {
      id: notificationId,
      userId,
      title,
      message,
      type,
      orderId: orderId || null,
      read: false,
      createdAt: new Date().toISOString()
    };

    await kv.set(`notification:${userId}:${notificationId}`, notification);

    return c.json({ data: notification }, 201);
  } catch (error) {
    console.error('Error creating notification:', error);
    return c.json({ error: 'Failed to create notification' }, 500);
  }
});

// Mark all notifications as read (MUST come before :id routes)
app.patch('/make-server-6d979413/notifications/read-all', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    // Don't log error for missing sessions (expected during logout/before login)
    if (!error.includes('Auth session missing')) {
      console.error('Auth error in PATCH read-all:', error);
    }
    return c.json({ error }, 401);
  }

  try {
    const notifications = await kv.getByPrefix(`notification:${userId}:`);

    const updatePromises = notifications.map((notification: any) => {
      const updatedNotification = { ...notification, read: true };
      return kv.set(`notification:${userId}:${notification.id}`, updatedNotification);
    });

    await Promise.all(updatePromises);

    return c.json({ data: { updated: notifications.length } });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return c.json({ error: 'Failed to update notifications' }, 500);
  }
});

// Mark notification as read
app.patch('/make-server-6d979413/notifications/:id/read', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    // Don't log error for missing sessions (expected during logout/before login)
    if (!error.includes('Auth session missing')) {
      console.error('Auth error in PATCH notification:', error);
    }
    return c.json({ error }, 401);
  }

  try {
    const notificationId = c.req.param('id');
    const key = `notification:${userId}:${notificationId}`;

    const notification = await kv.get(key);
    if (!notification) {
      return c.json({ error: 'Notification not found' }, 404);
    }

    const updatedNotification = {
      ...notification,
      read: true
    };

    await kv.set(key, updatedNotification);

    return c.json({ data: updatedNotification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return c.json({ error: 'Failed to update notification' }, 500);
  }
});

// Delete a notification
app.delete('/make-server-6d979413/notifications/:id', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    // Don't log error for missing sessions (expected during logout/before login)
    if (!error.includes('Auth session missing')) {
      console.error('Auth error in DELETE notification:', error);
    }
    return c.json({ error }, 401);
  }

  try {
    const notificationId = c.req.param('id');
    const key = `notification:${userId}:${notificationId}`;

    const notification = await kv.get(key);
    if (!notification) {
      return c.json({ error: 'Notification not found' }, 404);
    }

    await kv.del(key);

    return c.json({ data: { deleted: true } });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return c.json({ error: 'Failed to delete notification' }, 500);
  }
});

// ==================== CATEGORIES ENDPOINTS ====================

// Get all categories (public - all authenticated users can see)
app.get('/make-server-6d979413/categories', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    console.error('Auth error in GET categories:', error);
    return c.json({ error }, 401);
  }

  try {
    // Get user's businessId
    const userProfile = await kv.get(`user:${userId}`);
    if (!userProfile || !userProfile.businessId) {
      return c.json({ error: 'Usuario no asociado a ningún negocio' }, 404);
    }

    const allCategories = await kv.getByPrefix('category:');

    // Filter by businessId
    const businessCategories = (allCategories || []).filter((cat: any) => cat.businessId === userProfile.businessId);

    // Sort by creation date (newest first)
    businessCategories.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    return c.json({ data: businessCategories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return c.json({ error: 'Failed to fetch categories' }, 500);
  }
});

// Create category (admin only)
app.post('/make-server-6d979413/categories', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    console.error('Auth error in POST category:', error);
    return c.json({ error }, 401);
  }

  try {
    // Verify user is admin
    const userProfile = await kv.get(`user:${userId}`);
    if (userProfile?.role !== 'admin') {
      return c.json({ error: 'Unauthorized: Admin access required' }, 403);
    }

    if (!userProfile.businessId) {
      return c.json({ error: 'Usuario no asociado a ningún negocio' }, 404);
    }

    const body = await c.req.json();
    const { name, description, color } = body;

    // Validation
    if (!name) {
      return c.json({ error: 'Missing required field: name' }, 400);
    }

    const categoryId = crypto.randomUUID();
    const category = {
      id: categoryId,
      name,
      description: description || '',
      color: color || '#0047BA',
      businessId: userProfile.businessId, // Associate with business
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`category:${categoryId}`, category);

    console.log(`✓ Category created: ${name} (ID: ${categoryId}) for business ${userProfile.businessId}`);
    return c.json({ data: category }, 201);
  } catch (error) {
    console.error('Error creating category:', error);
    return c.json({ error: 'Failed to create category' }, 500);
  }
});

// Update category (admin only)
app.put('/make-server-6d979413/categories/:id', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    console.error('Auth error in PUT category:', error);
    return c.json({ error }, 401);
  }

  try {
    // Verify user is admin
    const userProfile = await kv.get(`user:${userId}`);
    if (userProfile?.role !== 'admin') {
      return c.json({ error: 'Unauthorized: Admin access required' }, 403);
    }

    if (!userProfile.businessId) {
      return c.json({ error: 'Usuario no asociado a ningún negocio' }, 404);
    }

    const categoryId = c.req.param('id');
    const existingCategory = await kv.get(`category:${categoryId}`);

    if (!existingCategory) {
      return c.json({ error: 'Category not found' }, 404);
    }

    // Verify category belongs to user's business
    if (existingCategory.businessId !== userProfile.businessId) {
      return c.json({ error: 'No tienes permiso para actualizar esta categoría' }, 403);
    }

    const body = await c.req.json();
    const updatedCategory = {
      ...existingCategory,
      ...body,
      id: categoryId,
      businessId: existingCategory.businessId, // ensure businessId doesn't change
      createdBy: existingCategory.createdBy, // ensure createdBy doesn't change
      createdAt: existingCategory.createdAt,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`category:${categoryId}`, updatedCategory);

    console.log(`✓ Category updated: ${updatedCategory.name} for business ${userProfile.businessId}`);
    return c.json({ data: updatedCategory });
  } catch (error) {
    console.error('Error updating category:', error);
    return c.json({ error: 'Failed to update category' }, 500);
  }
});

// Delete category (admin only)
app.delete('/make-server-6d979413/categories/:id', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    console.error('Auth error in DELETE category:', error);
    return c.json({ error }, 401);
  }

  try {
    // Verify user is admin
    const userProfile = await kv.get(`user:${userId}`);
    if (userProfile?.role !== 'admin') {
      return c.json({ error: 'Unauthorized: Admin access required' }, 403);
    }

    if (!userProfile.businessId) {
      return c.json({ error: 'Usuario no asociado a ningún negocio' }, 404);
    }

    const categoryId = c.req.param('id');
    const category = await kv.get(`category:${categoryId}`);

    if (!category) {
      return c.json({ error: 'Category not found' }, 404);
    }

    // Verify category belongs to user's business
    if (category.businessId !== userProfile.businessId) {
      return c.json({ error: 'No tienes permiso para eliminar esta categoría' }, 403);
    }

    // Check if category is being used by any product in the same business
    const allProducts = await kv.getByPrefix('product:');
    const productsInCategory = allProducts.filter((p: any) =>
      p.categoryId === categoryId && p.businessId === userProfile.businessId
    );

    if (productsInCategory.length > 0) {
      return c.json({
        error: `No se puede eliminar la categoría porque tiene ${productsInCategory.length} producto(s) asociado(s)`
      }, 400);
    }

    await kv.del(`category:${categoryId}`);

    console.log(`✓ Category deleted: ${category.name} from business ${userProfile.businessId}`);
    return c.json({ data: { deleted: true } });
  } catch (error) {
    console.error('Error deleting category:', error);
    return c.json({ error: 'Failed to delete category' }, 500);
  }
});


// ==================== PRODUCTION AREAS ENDPOINTS ====================


// Get all production areas (filtered by business)
app.get('/make-server-6d979413/production-areas', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    console.error('Auth error in GET production areas:', error);
    return c.json({ error }, 401);
  }

  try {
    // Get user's business ID
    const userProfile = await kv.get(`user:${userId}`);
    if (!userProfile?.businessId) {
      return c.json({ error: 'User has no associated business' }, 400);
    }

    // Get all production areas
    const allAreas = await kv.getByPrefix('production_area:');

    // Filter by business
    const businessAreas = allAreas.filter((area: any) => area.businessId === userProfile.businessId);

    // Sort by creation date (newest first)
    businessAreas.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    console.log(`✓ Fetched ${businessAreas.length} production areas for business ${userProfile.businessId}`);
    return c.json({ data: businessAreas });
  } catch (error) {
    console.error('Error fetching production areas:', error);
    return c.json({ error: 'Failed to fetch production areas' }, 500);
  }
});

// Create production area (admin only)
app.post('/make-server-6d979413/production-areas', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    console.error('Auth error in POST production area:', error);
    return c.json({ error }, 401);
  }

  try {
    // Verify user is admin
    const userProfile = await kv.get(`user:${userId}`);
    if (userProfile?.role !== 'admin') {
      return c.json({ error: 'Unauthorized: Admin access required' }, 403);
    }

    if (!userProfile?.businessId) {
      return c.json({ error: 'User has no associated business' }, 400);
    }

    const body = await c.req.json();
    const { name, description, color, icon } = body;

    // Validation
    if (!name || !name.trim()) {
      return c.json({ error: 'Name is required' }, 400);
    }

    // Check if area with same name exists in this business
    const allAreas = await kv.getByPrefix('production_area:');
    const existingArea = allAreas.find((area: any) =>
      area.businessId === userProfile.businessId &&
      area.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (existingArea) {
      return c.json({ error: `Production area "${name}" already exists in your business` }, 400);
    }

    const areaId = crypto.randomUUID();
    const productionArea = {
      id: areaId,
      name: name.trim(),
      description: description?.trim() || '',
      color: color || '#0059FF',
      icon: icon || 'Briefcase',
      businessId: userProfile.businessId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`production_area:${areaId}`, productionArea);

    console.log(`✓ Production area created: ${name} (ID: ${areaId}) for business ${userProfile.businessId}`);
    return c.json({ data: productionArea }, 201);
  } catch (error) {
    console.error('Error creating production area:', error);
    return c.json({ error: 'Failed to create production area' }, 500);
  }
});

// Update production area (admin only)
app.put('/make-server-6d979413/production-areas/:id', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    console.error('Auth error in PUT production area:', error);
    return c.json({ error }, 401);
  }

  try {
    // Verify user is admin
    const userProfile = await kv.get(`user:${userId}`);
    if (userProfile?.role !== 'admin') {
      return c.json({ error: 'Unauthorized: Admin access required' }, 403);
    }

    const areaId = c.req.param('id');
    const existingArea = await kv.get(`production_area:${areaId}`);

    if (!existingArea) {
      return c.json({ error: 'Production area not found' }, 404);
    }

    // Verify area belongs to user's business
    if (existingArea.businessId !== userProfile.businessId) {
      return c.json({ error: 'Unauthorized: Area belongs to different business' }, 403);
    }

    const body = await c.req.json();
    const { name, description, color, icon } = body;

    // If name is being changed, check for duplicates
    if (name && name.trim() !== existingArea.name) {
      const allAreas = await kv.getByPrefix('production_area:');
      const duplicateArea = allAreas.find((area: any) =>
        area.id !== areaId &&
        area.businessId === userProfile.businessId &&
        area.name.toLowerCase() === name.trim().toLowerCase()
      );

      if (duplicateArea) {
        return c.json({ error: `Production area "${name}" already exists in your business` }, 400);
      }
    }

    const updatedArea = {
      ...existingArea,
      name: name !== undefined ? name.trim() : existingArea.name,
      description: description !== undefined ? description.trim() : existingArea.description,
      color: color !== undefined ? color : existingArea.color,
      icon: icon !== undefined ? icon : existingArea.icon,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`production_area:${areaId}`, updatedArea);

    console.log(`✓ Production area updated: ${updatedArea.name} (ID: ${areaId})`);
    return c.json({ data: updatedArea });
  } catch (error) {
    console.error('Error updating production area:', error);
    return c.json({ error: 'Failed to update production area' }, 500);
  }
});

// Delete production area (admin only)
app.delete('/make-server-6d979413/production-areas/:id', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    console.error('Auth error in DELETE production area:', error);
    return c.json({ error }, 401);
  }

  try {
    // Verify user is admin
    const userProfile = await kv.get(`user:${userId}`);
    if (userProfile?.role !== 'admin') {
      return c.json({ error: 'Unauthorized: Admin access required' }, 403);
    }

    const areaId = c.req.param('id');
    const area = await kv.get(`production_area:${areaId}`);

    if (!area) {
      return c.json({ error: 'Production area not found' }, 404);
    }

    // Verify area belongs to user's business
    if (area.businessId !== userProfile.businessId) {
      return c.json({ error: 'Unauthorized: Area belongs to different business' }, 403);
    }

    // Check if any products are assigned to this area
    const allProducts = await kv.getByPrefix('product:');
    const productsInArea = allProducts.filter((product: any) => product.productionAreaId === areaId);

    if (productsInArea.length > 0) {
      return c.json({
        error: `Cannot delete production area because it has ${productsInArea.length} product(s) assigned to it. Please reassign or delete those products first.`
      }, 400);
    }

    await kv.del(`production_area:${areaId}`);

    console.log(`✓ Production area deleted: ${area.name} (ID: ${areaId})`);
    return c.json({ data: { deleted: true } });
  } catch (error) {
    console.error('Error deleting production area:', error);
    return c.json({ error: 'Failed to delete production area' }, 500);
  }
});

// ==================== INGREDIENTS ENDPOINTS ====================

// Get all ingredients (filtered by business)
app.get('/make-server-6d979413/ingredients', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    console.error('Auth error in GET ingredients:', error);
    return c.json({ error }, 401);
  }

  try {
    // Get user's business ID
    const userProfile = await kv.get(`user:${userId}`);
    if (!userProfile || !userProfile.businessId) {
      return c.json({ error: 'Usuario no asociado a ningún negocio' }, 404);
    }

    // Get all ingredients for this business
    const allIngredients = await kv.getByPrefix('ingredient:');
    const businessIngredients = allIngredients.filter(
      (ingredient: any) => ingredient.businessId === userProfile.businessId
    );

    console.log(`✓ Retrieved ${businessIngredients.length} ingredients for business ${userProfile.businessId}`);
    return c.json({ data: businessIngredients });
  } catch (error) {
    console.error('Error retrieving ingredients:', error);
    return c.json({ error: 'Failed to retrieve ingredients' }, 500);
  }
});

// Create new ingredient
app.post('/make-server-6d979413/ingredients', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    console.error('Auth error in POST ingredient:', error);
    return c.json({ error }, 401);
  }

  try {
    const ingredientData = await c.req.json();
    const { name, unit, currentStock, minStock, maxStock, costPerUnit, supplier } = ingredientData;

    // Validate required fields
    if (!name || !unit || currentStock === undefined || minStock === undefined) {
      return c.json({ error: 'Name, unit, currentStock, and minStock are required' }, 400);
    }

    // Get user's business ID
    const userProfile = await kv.get(`user:${userId}`);
    if (!userProfile || !userProfile.businessId) {
      return c.json({ error: 'Usuario no asociado a ningún negocio' }, 404);
    }

    // Check if ingredient with same name already exists in this business
    const allIngredients = await kv.getByPrefix('ingredient:');
    const existingIngredient = allIngredients.find((ing: any) =>
      ing.businessId === userProfile.businessId &&
      ing.name.toLowerCase().trim() === name.toLowerCase().trim()
    );

    if (existingIngredient) {
      console.warn(`Duplicate ingredient creation attempt: ${name} in business ${userProfile.businessId}`);
      return c.json({ error: `La materia prima "${name}" ya existe en este negocio` }, 400);
    }

    // Create new ingredient
    const ingredientId = crypto.randomUUID();
    const newIngredient = {
      id: ingredientId,
      name: name.trim(),
      unit: unit.trim(),
      currentStock: Number(currentStock),
      minStock: Number(minStock),
      maxStock: maxStock !== undefined ? Number(maxStock) : undefined,
      costPerUnit: costPerUnit !== undefined ? Number(costPerUnit) : undefined,
      supplier: supplier?.trim() || '',
      businessId: userProfile.businessId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`ingredient:${ingredientId}`, newIngredient);

    console.log(`✓ Ingredient created: ${newIngredient.name} (ID: ${ingredientId})`);
    return c.json({ data: newIngredient }, 201);
  } catch (error) {
    console.error('Error creating ingredient:', error);
    return c.json({ error: 'Failed to create ingredient' }, 500);
  }
});

// Update ingredient
app.put('/make-server-6d979413/ingredients/:id', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    console.error('Auth error in PUT ingredient:', error);
    return c.json({ error }, 401);
  }

  try {
    const ingredientId = c.req.param('id');
    const updates = await c.req.json();

    // Get user's business ID
    const userProfile = await kv.get(`user:${userId}`);
    if (!userProfile || !userProfile.businessId) {
      return c.json({ error: 'Usuario no asociado a ningún negocio' }, 404);
    }

    // Get existing ingredient
    const ingredient = await kv.get(`ingredient:${ingredientId}`);
    if (!ingredient) {
      return c.json({ error: 'Ingredient not found' }, 404);
    }

    // Verify ingredient belongs to user's business
    if (ingredient.businessId !== userProfile.businessId) {
      return c.json({ error: 'Unauthorized: Ingredient belongs to different business' }, 403);
    }

    // Update ingredient
    const updatedIngredient = {
      ...ingredient,
      ...updates,
      id: ingredientId,
      businessId: ingredient.businessId,
      createdAt: ingredient.createdAt,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`ingredient:${ingredientId}`, updatedIngredient);

    // Check if stock is at or below minimum after update
    const currentStock = updatedIngredient.currentStock;
    const minStock = updatedIngredient.minStock;
    const previousStock = ingredient.currentStock;

    // Only create notification if stock crossed the threshold (was above minimum, now at or below)
    if (currentStock <= minStock && previousStock > minStock) {
      console.log(`⚠️ Stock reached minimum for ${updatedIngredient.name}: ${currentStock} ${updatedIngredient.unit} (min: ${minStock})`);

      // Get all users with admin or production role to notify them
      const allUsersKeys = await kv.getByPrefix('user_profile:');
      const adminAndProductionUsers = allUsersKeys.filter((profile: any) =>
        profile.role === 'admin' || profile.role === 'production'
      );

      const notificationTitle = currentStock === 0
        ? '🚨 Stock Agotado de Materia Prima'
        : '⚠️ Stock Bajo de Materia Prima';
      const notificationMessage = currentStock === 0
        ? `El ingrediente "${updatedIngredient.name}" se ha agotado completamente. Stock actual: 0 ${updatedIngredient.unit}. Se requiere reabastecimiento urgente.`
        : `El ingrediente "${updatedIngredient.name}" está por debajo del stock mínimo. Stock actual: ${currentStock} ${updatedIngredient.unit}, mínimo requerido: ${minStock} ${updatedIngredient.unit}.`;

      for (const user of adminAndProductionUsers) {
        const notificationId = crypto.randomUUID();
        const notification = {
          id: notificationId,
          userId: user.userId,
          title: notificationTitle,
          message: notificationMessage,
          type: currentStock === 0 ? 'error' : 'warning',
          orderId: null,
          read: false,
          createdAt: new Date().toISOString(),
        };

        await kv.set(`notification:${notificationId}`, notification);
        console.log(`    ✅ Low stock notification created for user ${user.userId}`);
      }
    }

    console.log(`✓ Ingredient updated: ${updatedIngredient.name} (ID: ${ingredientId})`);
    return c.json({ data: updatedIngredient });
  } catch (error) {
    console.error('Error updating ingredient:', error);
    return c.json({ error: 'Failed to update ingredient' }, 500);
  }
});

// Delete ingredient
app.delete('/make-server-6d979413/ingredients/:id', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    console.error('Auth error in DELETE ingredient:', error);
    return c.json({ error }, 401);
  }

  try {
    const ingredientId = c.req.param('id');

    // Get user's business ID
    const userProfile = await kv.get(`user:${userId}`);
    if (!userProfile || !userProfile.businessId) {
      return c.json({ error: 'Usuario no asociado a ningún negocio' }, 404);
    }

    // Get ingredient
    const ingredient = await kv.get(`ingredient:${ingredientId}`);
    if (!ingredient) {
      return c.json({ error: 'Ingredient not found' }, 404);
    }

    // Verify ingredient belongs to user's business
    if (ingredient.businessId !== userProfile.businessId) {
      return c.json({ error: 'Unauthorized: Ingredient belongs to different business' }, 403);
    }

    // Check if ingredient is used in any product recipes
    const allProductIngredients = await kv.getByPrefix('product_ingredient:');
    const usedInProducts = allProductIngredients.filter(
      (pi: any) => pi.ingredientId === ingredientId
    );

    if (usedInProducts.length > 0) {
      return c.json({
        error: `No se puede eliminar esta materia prima porque está siendo usada en ${usedInProducts.length} receta(s). Por favor, elimina primero las recetas que la usan.`
      }, 400);
    }

    await kv.del(`ingredient:${ingredientId}`);

    console.log(`✓ Ingredient deleted: ${ingredient.name} (ID: ${ingredientId})`);
    return c.json({ data: { deleted: true } });
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    return c.json({ error: 'Failed to delete ingredient' }, 500);
  }
});

// ==================== PRODUCT INGREDIENTS ENDPOINTS ====================

// Get product ingredients for a specific product
app.get('/make-server-6d979413/product-ingredients/:productId', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    console.error('Auth error in GET product ingredients:', error);
    return c.json({ error }, 401);
  }

  try {
    const productId = c.req.param('productId');

    // Get user's business ID
    const userProfile = await kv.get(`user:${userId}`);
    if (!userProfile || !userProfile.businessId) {
      return c.json({ error: 'Usuario no asociado a ningún negocio' }, 404);
    }

    // Get product to verify it belongs to user's business
    const product = await kv.get(`product:${productId}`);
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }

    if (product.businessId !== userProfile.businessId) {
      return c.json({ error: 'Unauthorized: Product belongs to different business' }, 403);
    }

    // Get all product ingredients for this product
    const allProductIngredients = await kv.getByPrefix(`product_ingredient:${productId}:`);

    // Enrich with ingredient details
    const enrichedIngredients = await Promise.all(
      allProductIngredients.map(async (pi: any) => {
        const ingredient = await kv.get(`ingredient:${pi.ingredientId}`);
        return {
          ...pi,
          ingredientName: ingredient?.name || 'Unknown',
          unit: ingredient?.unit || '',
          currentStock: ingredient?.currentStock || 0,
        };
      })
    );

    console.log(`✓ Retrieved ${enrichedIngredients.length} ingredients for product ${productId}`);
    return c.json({ data: enrichedIngredients });
  } catch (error) {
    console.error('Error retrieving product ingredients:', error);
    return c.json({ error: 'Failed to retrieve product ingredients' }, 500);
  }
});

// Set product ingredients (replace all)
app.post('/make-server-6d979413/product-ingredients/:productId', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    console.error('Auth error in POST product ingredients:', error);
    return c.json({ error }, 401);
  }

  try {
    const productId = c.req.param('productId');
    const { ingredients } = await c.req.json();

    if (!Array.isArray(ingredients)) {
      return c.json({ error: 'Ingredients must be an array' }, 400);
    }

    // Get user's business ID
    const userProfile = await kv.get(`user:${userId}`);
    if (!userProfile || !userProfile.businessId) {
      return c.json({ error: 'Usuario no asociado a ningún negocio' }, 404);
    }

    // Get product to verify it belongs to user's business
    const product = await kv.get(`product:${productId}`);
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }

    if (product.businessId !== userProfile.businessId) {
      return c.json({ error: 'Unauthorized: Product belongs to different business' }, 403);
    }

    // Delete existing product ingredients
    const existingIngredients = await kv.getByPrefix(`product_ingredient:${productId}:`);
    for (const existing of existingIngredients) {
      await kv.del(`product_ingredient:${productId}:${existing.ingredientId}`);
    }

    // Create new product ingredients
    const createdIngredients = [];
    for (const ing of ingredients) {
      if (!ing.ingredientId || ing.quantity === undefined) {
        continue; // Skip invalid entries
      }

      const productIngredient = {
        productId,
        ingredientId: ing.ingredientId,
        quantity: Number(ing.quantity),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await kv.set(`product_ingredient:${productId}:${ing.ingredientId}`, productIngredient);
      createdIngredients.push(productIngredient);
    }

    console.log(`✓ Set ${createdIngredients.length} ingredients for product ${productId}`);
    return c.json({ data: createdIngredients }, 201);
  } catch (error) {
    console.error('Error setting product ingredients:', error);
    return c.json({ error: 'Failed to set product ingredients' }, 500);
  }
});

// Delete product ingredient
app.delete('/make-server-6d979413/product-ingredients/:productId/:ingredientId', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    console.error('Auth error in DELETE product ingredient:', error);
    return c.json({ error }, 401);
  }

  try {
    const productId = c.req.param('productId');
    const ingredientId = c.req.param('ingredientId');

    // Get user's business ID
    const userProfile = await kv.get(`user:${userId}`);
    if (!userProfile || !userProfile.businessId) {
      return c.json({ error: 'Usuario no asociado a ningún negocio' }, 404);
    }

    // Get product to verify it belongs to user's business
    const product = await kv.get(`product:${productId}`);
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }

    if (product.businessId !== userProfile.businessId) {
      return c.json({ error: 'Unauthorized: Product belongs to different business' }, 403);
    }

    await kv.del(`product_ingredient:${productId}:${ingredientId}`);

    console.log(`✓ Product ingredient deleted: Product ${productId}, Ingredient ${ingredientId}`);
    return c.json({ data: { deleted: true } });
  } catch (error) {
    console.error('Error deleting product ingredient:', error);
    return c.json({ error: 'Failed to delete product ingredient' }, 500);
  }
});

// ============================================
// ATTENDANCE ENDPOINTS
// ============================================

// Get all locals (users with role 'local')
app.get('/make-server-6d979413/attendance/locals', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    console.error('Auth error in get locals:', error);
    return c.json({ error }, 401);
  }

  try {
    // Get user's businessId
    const userProfile = await kv.get(`user:${userId}`);
    if (!userProfile || !userProfile.businessId) {
      return c.json({ error: 'Usuario no asociado a ningún negocio' }, 404);
    }

    // Get all users
    const allUsers = await kv.getByPrefix('user:');

    // Filter users with role 'local', same business, and exclude demo accounts
    const locals = allUsers
      .filter((u: any) =>
        u.role === 'local' &&
        u.businessId === userProfile.businessId &&
        !u.email?.includes('@demo.com') // Exclude demo local accounts
      )
      .map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role
      }));

    console.log(`✓ Retrieved ${locals.length} local users for business ${userProfile.businessId}`);
    return c.json({ data: locals });
  } catch (error) {
    console.error('Error getting locals:', error);
    return c.json({ error: 'Failed to get locals' }, 500);
  }
});

// Check in (create new attendance record for today)
app.post('/make-server-6d979413/attendance/check-in', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId, user } = await verifyAuth(authHeader);

  if (error) {
    console.error('Auth error in attendance check-in:', error);
    return c.json({ error }, 401);
  }

  try {
    const body = await c.req.json().catch(() => ({}));
    const { localId } = body;

    if (!localId) {
      return c.json({ error: 'Debes seleccionar un local' }, 400);
    }

    // Get user profile to get the name and businessId
    const userProfile = await kv.get(`user:${userId}`);
    if (!userProfile || !userProfile.businessId) {
      return c.json({ error: 'Usuario no asociado a ningún negocio' }, 404);
    }

    const userName = userProfile?.name || user?.email || 'Usuario';

    // Verify local exists and belongs to same business
    const local = await kv.get(`user:${localId}`);
    if (!local || local.role !== 'local') {
      return c.json({ error: 'Local no válido' }, 400);
    }

    if (local.businessId !== userProfile.businessId) {
      return c.json({ error: 'El local seleccionado no pertenece a tu negocio' }, 403);
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD

    // Check if user already has an ACTIVE check-in (any local, any date) IN THEIR BUSINESS
    const allRecords = await kv.getByPrefix(`attendance:`);
    const activeRecord = allRecords.find((r: any) =>
      r.userId === userId &&
      r.businessId === userProfile.businessId &&
      r.status === 'active' &&
      (r.checkOut === null || r.checkOut === undefined)
    );

    if (activeRecord) {
      console.log(`❌ User ${userId} already has active check-in at local ${activeRecord.localName}`);
      return c.json({
        error: `Ya tienes una asistencia activa en ${activeRecord.localName}. Debes marcar salida primero.`
      }, 400);
    }

    // Create new attendance record
    const recordId = `${userId}:${today}:${now.getTime()}`;
    const attendanceRecord = {
      id: recordId,
      userId,
      userName,
      businessId: userProfile.businessId, // Associate with business
      localId,
      localName: local.name,
      checkIn: now.toISOString(),
      checkOut: null,
      date: today,
      status: 'active'
    };

    await kv.set(`attendance:${recordId}`, attendanceRecord);

    // Create notification for the user
    const notificationId = crypto.randomUUID();
    const checkInTime = new Date(now).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
    const notification = {
      id: notificationId,
      userId,
      title: '✅ Entrada registrada',
      message: `Has marcado entrada en ${local.name} a las ${checkInTime}`,
      type: 'attendance_check_in',
      read: false,
      createdAt: now.toISOString()
    };
    await kv.set(`notification:${userId}:${notificationId}`, notification);

    console.log(`✓ Check-in recorded for user ${userName} at local ${local.name} at ${now.toISOString()}`);
    return c.json({ data: attendanceRecord });
  } catch (error) {
    console.error('Error in check-in:', error);
    return c.json({ error: 'Failed to check in' }, 500);
  }
});

// Check out (update existing attendance record)
app.put('/make-server-6d979413/attendance/check-out/:recordId', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    console.error('Auth error in attendance check-out:', error);
    return c.json({ error }, 401);
  }

  try {
    const recordId = c.req.param('recordId');
    const record = await kv.get(`attendance:${recordId}`);

    if (!record) {
      return c.json({ error: 'Registro no encontrado' }, 404);
    }

    if (record.userId !== userId) {
      return c.json({ error: 'No autorizado' }, 403);
    }

    if (record.checkOut) {
      return c.json({ error: 'Ya has marcado salida para este registro' }, 400);
    }

    const now = new Date();
    record.checkOut = now.toISOString();
    record.status = 'completed';

    await kv.set(`attendance:${recordId}`, record);

    // Create notification for the user
    const notificationId = crypto.randomUUID();
    const checkOutTime = new Date(now).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });

    // Calculate total time worked
    const checkInDate = new Date(record.checkIn);
    const checkOutDate = new Date(now);
    const diffMs = checkOutDate.getTime() - checkInDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const timeWorked = diffHours > 0
      ? `${diffHours}h ${diffMinutes}min`
      : `${diffMinutes} minutos`;

    const notification = {
      id: notificationId,
      userId,
      title: '🏁 Salida registrada',
      message: `Has marcado salida de ${record.localName} a las ${checkOutTime}. Tiempo trabajado: ${timeWorked}`,
      type: 'attendance_check_out',
      read: false,
      createdAt: now.toISOString()
    };
    await kv.set(`notification:${userId}:${notificationId}`, notification);

    console.log(`✓ Check-out recorded for user ${record.userName} at ${now.toISOString()}`);
    return c.json({ data: record });
  } catch (error) {
    console.error('Error in check-out:', error);
    return c.json({ error: 'Failed to check out' }, 500);
  }
});

// Get my attendance records
app.get('/make-server-6d979413/attendance/my-records', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    console.error('Auth error in get my attendance records:', error);
    return c.json({ error }, 401);
  }

  try {
    const records = await kv.getByPrefix(`attendance:${userId}`);

    // Sort by date descending (newest first)
    const sortedRecords = records.sort((a: any, b: any) => {
      return new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime();
    });

    return c.json({ data: sortedRecords });
  } catch (error) {
    console.error('Error getting attendance records:', error);
    return c.json({ error: 'Failed to get attendance records' }, 500);
  }
});

// Get all attendance records (admin only) - filtered by business
app.get('/make-server-6d979413/attendance/all-records', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    console.error('Auth error in get all attendance records:', error);
    return c.json({ error }, 401);
  }

  try {
    // Verify user is admin or production
    const userProfile = await kv.get(`user:${userId}`);
    if (userProfile?.role !== 'admin' && userProfile?.role !== 'production') {
      return c.json({ error: 'Unauthorized: Admin or production access required' }, 403);
    }

    if (!userProfile.businessId) {
      return c.json({ error: 'Usuario no asociado a ningún negocio' }, 404);
    }

    const allRecords = await kv.getByPrefix('attendance:');

    // Filter by businessId
    const businessRecords = allRecords.filter((r: any) => r.businessId === userProfile.businessId);

    // Sort by date descending (newest first)
    const sortedRecords = businessRecords.sort((a: any, b: any) => {
      return new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime();
    });

    return c.json({ data: sortedRecords });
  } catch (error) {
    console.error('Error getting all attendance records:', error);
    return c.json({ error: 'Failed to get attendance records' }, 500);
  }
});

// Get attendance records by date
app.get('/make-server-6d979413/attendance/records/:date', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    console.error('Auth error in get attendance by date:', error);
    return c.json({ error }, 401);
  }

  try {
    const date = c.req.param('date');
    const allRecords = await kv.getByPrefix('attendance:');

    // Filter by date
    const dateRecords = allRecords.filter((r: any) => r.date === date);

    // Filter by user if not admin
    const userProfile = await kv.get(`user:${userId}`);
    if (userProfile?.role !== 'admin' && userProfile?.role !== 'production') {
      return c.json({
        data: dateRecords.filter((r: any) => r.userId === userId)
      });
    }

    return c.json({ data: dateRecords });
  } catch (error) {
    console.error('Error getting attendance records by date:', error);
    return c.json({ error: 'Failed to get attendance records' }, 500);
  }
});

// Update attendance record (admin only)
app.put('/make-server-6d979413/attendance/records/:recordId', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    console.error('Auth error in update attendance record:', error);
    return c.json({ error }, 401);
  }

  try {
    // Verify user is admin
    const userProfile = await kv.get(`user:${userId}`);
    if (userProfile?.role !== 'admin') {
      return c.json({ error: 'Unauthorized: Admin access required' }, 403);
    }

    const recordId = c.req.param('recordId');
    const record = await kv.get(`attendance:${recordId}`);

    if (!record) {
      return c.json({ error: 'Record not found' }, 404);
    }

    const body = await c.req.json();
    const updatedRecord = { ...record, ...body };

    await kv.set(`attendance:${recordId}`, updatedRecord);

    console.log(`✓ Attendance record updated by admin: ${recordId}`);
    return c.json({ data: updatedRecord });
  } catch (error) {
    console.error('Error updating attendance record:', error);
    return c.json({ error: 'Failed to update attendance record' }, 500);
  }
});

// Delete attendance record (admin only)
app.delete('/make-server-6d979413/attendance/records/:recordId', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    console.error('Auth error in delete attendance record:', error);
    return c.json({ error }, 401);
  }

  try {
    // Verify user is admin
    const userProfile = await kv.get(`user:${userId}`);
    if (userProfile?.role !== 'admin') {
      return c.json({ error: 'Unauthorized: Admin access required' }, 403);
    }

    const recordId = c.req.param('recordId');
    const record = await kv.get(`attendance:${recordId}`);

    if (!record) {
      return c.json({ error: 'Record not found' }, 404);
    }

    await kv.del(`attendance:${recordId}`);

    console.log(`✓ Attendance record deleted by admin: ${recordId}`);
    return c.json({ data: { deleted: true } });
  } catch (error) {
    console.error('Error deleting attendance record:', error);
    return c.json({ error: 'Failed to delete attendance record' }, 500);
  }
});

// NOTIFICATIONS ROUTES

// Get all notifications for current user
app.get('/make-server-6d979413/notifications', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    // Only log non-missing session errors (missing sessions are expected during polling)
    if (!error.includes('Auth session missing')) {
      console.error('Auth error in get notifications:', error);
    }
    return c.json({ error }, 401);
  }

  try {
    // Get all notifications from KV store
    const allNotifications = await kv.getByPrefix('notification:');

    // Filter notifications for current user and sort by date (newest first)
    const userNotifications = allNotifications
      .filter((n: any) => n.userId === userId)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    console.log(`✓ Retrieved ${userNotifications.length} notifications for user ${userId}`);
    return c.json({ data: userNotifications });
  } catch (error) {
    console.error('Error getting notifications:', error);
    return c.json({ error: 'Failed to get notifications' }, 500);
  }
});

// Create a new notification
app.post('/make-server-6d979413/notifications', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    console.error('Auth error in create notification:', error);
    return c.json({ error }, 401);
  }

  try {
    const { title, message, type, orderId, targetUserId } = await c.req.json();

    if (!title || !message || !type) {
      return c.json({ error: 'Title, message, and type are required' }, 400);
    }

    const notificationId = crypto.randomUUID();
    const notification = {
      id: notificationId,
      userId: targetUserId || userId, // Allow creating notifications for other users (admin feature)
      title,
      message,
      type,
      orderId: orderId || null,
      read: false,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`notification:${notificationId}`, notification);

    console.log(`✓ Notification created: ${notificationId} for user ${notification.userId}`);
    return c.json({ data: notification });
  } catch (error) {
    console.error('Error creating notification:', error);
    return c.json({ error: 'Failed to create notification' }, 500);
  }
});

// Mark notification as read
app.patch('/make-server-6d979413/notifications/:id/read', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    console.error('Auth error in mark notification as read:', error);
    return c.json({ error }, 401);
  }

  try {
    const notificationId = c.req.param('id');
    const notification = await kv.get(`notification:${notificationId}`);

    if (!notification) {
      return c.json({ error: 'Notification not found' }, 404);
    }

    // Verify user owns the notification
    if (notification.userId !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const updatedNotification = {
      ...notification,
      read: true,
    };

    await kv.set(`notification:${notificationId}`, updatedNotification);

    console.log(`✓ Notification marked as read: ${notificationId}`);
    return c.json({ data: updatedNotification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return c.json({ error: 'Failed to mark notification as read' }, 500);
  }
});

// Mark all notifications as read for current user
app.patch('/make-server-6d979413/notifications/read-all', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    console.error('Auth error in mark all notifications as read:', error);
    return c.json({ error }, 401);
  }

  try {
    const allNotifications = await kv.getByPrefix('notification:');
    const userNotifications = allNotifications.filter((n: any) => n.userId === userId && !n.read);

    let updated = 0;
    for (const notification of userNotifications) {
      const updatedNotification = {
        ...notification,
        read: true,
      };
      await kv.set(`notification:${notification.id}`, updatedNotification);
      updated++;
    }

    console.log(`✓ Marked ${updated} notifications as read for user ${userId}`);
    return c.json({ data: { updated } });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return c.json({ error: 'Failed to mark all notifications as read' }, 500);
  }
});

// Delete a notification
app.delete('/make-server-6d979413/notifications/:id', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    console.error('Auth error in delete notification:', error);
    return c.json({ error }, 401);
  }

  try {
    const notificationId = c.req.param('id');
    const notification = await kv.get(`notification:${notificationId}`);

    if (!notification) {
      return c.json({ error: 'Notification not found' }, 404);
    }

    // Verify user owns the notification
    if (notification.userId !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    await kv.del(`notification:${notificationId}`);

    console.log(`✓ Notification deleted: ${notificationId}`);
    return c.json({ data: { deleted: true } });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return c.json({ error: 'Failed to delete notification' }, 500);
  }
});

// PRODUCTION ORDERS ROUTES

// Get all production orders for current user's business
app.get('/make-server-6d979413/production-orders', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    console.error('Auth error in get production orders:', error);
    return c.json({ error }, 401);
  }

  try {
    // Get user profile to find business
    const userProfile = await kv.get(`user:${userId}`);
    if (!userProfile || !userProfile.businessId) {
      return c.json({ error: 'User or business not found' }, 404);
    }

    // Get all production orders for this business
    const allOrders = await kv.getByPrefix('production_order:');
    const businessOrders = allOrders.filter((order: any) => order.businessId === userProfile.businessId);

    // Sort by createdAt (newest first)
    businessOrders.sort((a: any, b: any) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    console.log(`✓ Retrieved ${businessOrders.length} production orders for business ${userProfile.businessId}`);
    return c.json({ orders: businessOrders });
  } catch (error) {
    console.error('Error getting production orders:', error);
    return c.json({ error: 'Failed to get production orders' }, 500);
  }
});

// Create new production order
app.post('/make-server-6d979413/production-orders', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    console.error('Auth error in create production order:', error);
    return c.json({ error }, 401);
  }

  try {
    // Verify user has production or admin role
    const userProfile = await kv.get(`user:${userId}`);
    if (!userProfile || !userProfile.businessId) {
      return c.json({ error: 'User or business not found' }, 404);
    }

    if (userProfile.role !== 'production' && userProfile.role !== 'admin') {
      return c.json({ error: 'Unauthorized: Production or Admin role required' }, 403);
    }

    const body = await c.req.json();
    const { products, notes } = body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return c.json({ error: 'Products array is required' }, 400);
    }

    // Validate products and get current stock
    const validatedProducts = [];
    for (const item of products) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        return c.json({ error: 'Each product must have productId and quantity > 0' }, 400);
      }

      const product = await kv.get(`product:${item.productId}`);
      if (!product) {
        return c.json({ error: `Product ${item.productId} not found` }, 404);
      }

      validatedProducts.push({
        productId: item.productId,
        name: product.name,
        quantity: item.quantity,
        currentStock: product.stock || 0,
      });
    }

    // Create production order
    const orderId = crypto.randomUUID();
    const now = new Date().toISOString();

    // Get product name for display (first product or summary)
    const productName = validatedProducts.length === 1
      ? validatedProducts[0].name
      : `${validatedProducts.length} productos`;

    const productionOrder = {
      id: orderId,
      productName,
      quantity: validatedProducts.reduce((sum, p) => sum + p.quantity, 0),
      status: 'BORRADOR',
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
      products: validatedProducts,
      notes: notes || undefined,
      businessId: userProfile.businessId,
    };

    await kv.set(`production_order:${orderId}`, productionOrder);

    console.log(`✓ Production order created: ${orderId} by user ${userId}`);
    return c.json({ order: productionOrder }, 201);
  } catch (error) {
    console.error('Error creating production order:', error);
    return c.json({ error: 'Failed to create production order' }, 500);
  }
});

// Update production order status
app.patch('/make-server-6d979413/production-orders/:orderId/status', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    console.error('Auth error in update production order:', error);
    return c.json({ error }, 401);
  }

  try {
    // Verify user has production or admin role
    const userProfile = await kv.get(`user:${userId}`);
    if (!userProfile) {
      return c.json({ error: 'User not found' }, 404);
    }

    if (userProfile.role !== 'production' && userProfile.role !== 'admin') {
      return c.json({ error: 'Unauthorized: Production or Admin role required' }, 403);
    }

    const orderId = c.req.param('orderId');
    const productionOrder = await kv.get(`production_order:${orderId}`);

    if (!productionOrder) {
      return c.json({ error: 'Production order not found' }, 404);
    }

    // Verify order belongs to user's business
    if (productionOrder.businessId !== userProfile.businessId) {
      return c.json({ error: 'Unauthorized: Order belongs to different business' }, 403);
    }

    const body = await c.req.json();
    const { status, products } = body;

    // Validate status
    const validStatuses = ['BORRADOR', 'EN_PROCESO', 'TERMINADA'];
    if (!status || !validStatuses.includes(status)) {
      return c.json({ error: 'Invalid status. Must be: BORRADOR, EN_PROCESO, or TERMINADA' }, 400);
    }

    const now = new Date().toISOString();

    // If updating products with produced/waste quantity (only when completing)
    let updatedProducts = productionOrder.products;
    if (status === 'TERMINADA' && products && Array.isArray(products)) {
      // Map over existing products and update with new data if ID matches
      updatedProducts = productionOrder.products.map((p: any) => {
        const updateData = products.find((u: any) => u.productId === p.productId);
        if (updateData) {
          return {
            ...p,
            producedQuantity: updateData.producedQuantity !== undefined ? Number(updateData.producedQuantity) : p.quantity,
            wasteQuantity: updateData.wasteQuantity !== undefined ? Number(updateData.wasteQuantity) : 0
          };
        }
        return p;
      });
    }

    const updatedOrder = {
      ...productionOrder,
      status,
      products: updatedProducts,
      updatedAt: now,
      completedAt: status === 'TERMINADA' ? now : productionOrder.completedAt,
    };

    // If starting production (BORRADOR -> EN_PROCESO), deduct ingredients from stock
    if (status === 'EN_PROCESO' && productionOrder.status === 'BORRADOR') {
      console.log(`🔧 Starting production order ${orderId} - deducting ingredients from stock...`);
      console.log(`   Order has ${productionOrder.products.length} products`);

      // PHASE 1: Collect all required ingredients and validate stock
      const insufficientStockErrors: string[] = [];
      const ingredientsToDeduct: Array<{
        ingredientId: string;
        ingredient: any;
        totalNeeded: number;
        newStock: number;
      }> = [];

      for (const item of productionOrder.products) {
        console.log(`  🔍 Processing product: ${item.name} (ID: ${item.productId})`);

        const product = await kv.get(`product:${item.productId}`);
        if (!product) {
          console.log(`  ⚠️ Product ${item.productId} not found in KV store`);
          continue;
        }
        console.log(`  ✓ Product found in KV store`);

        // Get product ingredients
        const prefix = `product-ingredient:${item.productId}:`;
        console.log(`  🔍 Looking for ingredients with prefix: ${prefix}`);
        let ingredientRelations = await kv.getByPrefix(prefix);

        // Fallback: Use legacy ingredients array if no relations found
        if ((!ingredientRelations || ingredientRelations.length === 0) && product.ingredients && Array.isArray(product.ingredients) && product.ingredients.length > 0) {
          console.log(`⚠️ No product-ingredient relations found for ${item.productId}, using legacy 'ingredients' array for stock deduction`);
          ingredientRelations = product.ingredients.map((pi: any) => ({
            ingredientId: pi.ingredientId,
            quantity: pi.quantity
          }));
        }

        console.log(`  📊 Found ${ingredientRelations?.length || 0} ingredient relations`);

        if (ingredientRelations && ingredientRelations.length > 0) {
          console.log(`  📝 Product ${item.name} has ${ingredientRelations.length} ingredients`);

          for (const relation of ingredientRelations) {
            console.log(`    🔍 Processing ingredient relation:`, JSON.stringify(relation));

            const ingredient = await kv.get(`ingredient:${relation.ingredientId}`);
            if (!ingredient) {
              console.log(`    ⚠️ Ingredient ${relation.ingredientId} not found in KV store`);
              continue;
            }
            console.log(`    ✓ Ingredient found: ${ingredient.name} (Current stock: ${ingredient.currentStock} ${ingredient.unit})`);

            // Calculate total needed (quantity per product * number of products)
            const totalNeeded = relation.quantity * item.quantity;
            const newStock = ingredient.currentStock - totalNeeded;
            console.log(`    📊 Calculation: ${relation.quantity} ${ingredient.unit}/product × ${item.quantity} products = ${totalNeeded} ${ingredient.unit} needed`);
            console.log(`    📊 New stock would be: ${ingredient.currentStock} - ${totalNeeded} = ${newStock}`);

            // Check if there's enough stock
            if (newStock < 0) {
              insufficientStockErrors.push(
                `${ingredient.name}: necesita ${totalNeeded} ${ingredient.unit}, solo hay ${ingredient.currentStock} ${ingredient.unit}`
              );
              console.log(`    ❌ Insufficient stock for ${ingredient.name}: need ${totalNeeded}, have ${ingredient.currentStock}`);
            } else {
              // Add to deduction list (will only execute if all validations pass)
              ingredientsToDeduct.push({
                ingredientId: relation.ingredientId,
                ingredient,
                totalNeeded,
                newStock
              });
            }
          }
        } else {
          console.log(`  ℹ️ Product ${item.name} has no ingredients configured`);
        }
      }

      // If there were insufficient stock errors, return error WITHOUT deducting anything
      if (insufficientStockErrors.length > 0) {
        console.log(`❌ Returning error due to insufficient stock:`, insufficientStockErrors);
        return c.json({
          error: 'Stock insuficiente de materias primas',
          details: insufficientStockErrors
        }, 400);
      }

      // PHASE 2: All validations passed - now deduct stock
      console.log(`✅ All stock validations passed. Deducting ${ingredientsToDeduct.length} ingredients...`);
      const lowStockIngredients: Array<{ name: string; currentStock: number; minStock: number; unit: string }> = [];

      for (const item of ingredientsToDeduct) {
        const updatedIngredient = {
          ...item.ingredient,
          currentStock: item.newStock,
          updatedAt: now,
        };
        await kv.set(`ingredient:${item.ingredientId}`, updatedIngredient);
        console.log(`    ✅ STOCK UPDATED - ${item.ingredient.name}: ${item.ingredient.currentStock} → ${item.newStock} (-${item.totalNeeded} ${item.ingredient.unit})`);

        // Check if stock is at or below minimum
        if (item.newStock <= item.ingredient.minStock) {
          console.log(`    ⚠️ LOW STOCK ALERT - ${item.ingredient.name}: ${item.newStock} ${item.ingredient.unit} (mínimo: ${item.ingredient.minStock} ${item.ingredient.unit})`);
          lowStockIngredients.push({
            name: item.ingredient.name,
            currentStock: item.newStock,
            minStock: item.ingredient.minStock,
            unit: item.ingredient.unit
          });
        }
      }

      // Create low stock notifications for admin and production users
      if (lowStockIngredients.length > 0) {
        console.log(`📢 Creating low stock notifications for ${lowStockIngredients.length} ingredients...`);

        // Get all users with admin or production role to notify them
        const allUsersKeys = await kv.getByPrefix('user_profile:');
        const adminAndProductionUsers = allUsersKeys.filter((profile: any) =>
          profile.role === 'admin' || profile.role === 'production'
        );

        // Create notifications for each low stock ingredient for each admin/production user
        for (const ingredient of lowStockIngredients) {
          const stockStatus = ingredient.currentStock === 0 ? 'agotado' : 'bajo mínimo';
          const notificationTitle = ingredient.currentStock === 0
            ? '🚨 Stock Agotado de Materia Prima'
            : '⚠️ Stock Bajo de Materia Prima';
          const notificationMessage = ingredient.currentStock === 0
            ? `El ingrediente "${ingredient.name}" se ha agotado completamente. Stock actual: 0 ${ingredient.unit}. Se requiere reabastecimiento urgente.`
            : `El ingrediente "${ingredient.name}" está por debajo del stock mínimo. Stock actual: ${ingredient.currentStock} ${ingredient.unit}, mínimo requerido: ${ingredient.minStock} ${ingredient.unit}.`;

          for (const user of adminAndProductionUsers) {
            const notificationId = crypto.randomUUID();
            const notification = {
              id: notificationId,
              userId: user.userId,
              title: notificationTitle,
              message: notificationMessage,
              type: ingredient.currentStock === 0 ? 'error' : 'warning',
              orderId: null,
              read: false,
              createdAt: now,
            };

            await kv.set(`notification:${notificationId}`, notification);
            console.log(`    ✅ Notification created for user ${user.userId}: ${notificationTitle}`);
          }
        }

        console.log(`✅ Created low stock notifications for ${adminAndProductionUsers.length} users`);
      }

      console.log(`✅ All ingredients deducted successfully!`);
    }

    // If completing the order, increase stock for all products
    if (status === 'TERMINADA' && productionOrder.status !== 'TERMINADA') {
      console.log(`📦 Completing production order ${orderId} - updating stock...`);

      for (const item of updatedProducts) {
        const product = await kv.get(`product:${item.productId}`);
        if (product) {
          // Use producedQuantity if available (actual output), otherwise fallback to planned quantity
          const quantityToAdd = item.producedQuantity !== undefined ? item.producedQuantity : item.quantity;
          const newStock = (product.stock || 0) + quantityToAdd;
          const updatedProduct = {
            ...product,
            stock: newStock,
            updatedAt: now,
          };
          await kv.set(`product:${item.productId}`, updatedProduct);
          console.log(`  ✓ Updated ${item.name}: ${product.stock || 0} → ${newStock} (+${quantityToAdd})`);
          if (item.wasteQuantity > 0) {
            console.log(`  ⚠️ Recorded ${item.wasteQuantity} waste for ${item.name}`);
          }
        }
      }
    }

    await kv.set(`production_order:${orderId}`, updatedOrder);

    console.log(`✓ Production order ${orderId} status updated to: ${status}`);
    return c.json({ order: updatedOrder });
  } catch (error) {
    console.error('Error updating production order status:', error);
    return c.json({ error: 'Failed to update production order status' }, 500);
  }
});

// Delete production order (only BORRADOR can be deleted)
app.delete('/make-server-6d979413/production-orders/:orderId', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, userId } = await verifyAuth(authHeader);

  if (error) {
    console.error('Auth error in delete production order:', error);
    return c.json({ error }, 401);
  }

  try {
    // Verify user has production or admin role
    const userProfile = await kv.get(`user:${userId}`);
    if (!userProfile) {
      return c.json({ error: 'User not found' }, 404);
    }

    if (userProfile.role !== 'production' && userProfile.role !== 'admin') {
      return c.json({ error: 'Unauthorized: Production or Admin role required' }, 403);
    }

    const orderId = c.req.param('orderId');
    const productionOrder = await kv.get(`production_order:${orderId}`);

    if (!productionOrder) {
      return c.json({ error: 'Production order not found' }, 404);
    }

    // Verify order belongs to user's business
    if (productionOrder.businessId !== userProfile.businessId) {
      return c.json({ error: 'Unauthorized: Order belongs to different business' }, 403);
    }

    // Only BORRADOR orders can be deleted
    if (productionOrder.status !== 'BORRADOR') {
      return c.json({ error: 'Only BORRADOR orders can be deleted' }, 400);
    }

    await kv.del(`production_order:${orderId}`);

    console.log(`✓ Production order deleted: ${orderId}`);
    return c.json({ data: { deleted: true } });
  } catch (error) {
    console.error('Error deleting production order:', error);
    return c.json({ error: 'Failed to delete production order' }, 500);
  }
});

console.log('🚀 Server initialized successfully - Ready to handle requests');
console.log('📍 Base path: /make-server-6d979413');

Deno.serve(app.fetch);
