import { supabase, supabaseAdmin } from "../config";
import { ApiError } from "../utils";

export interface SignUpData {
  email: string;
  password: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    createdAt: string;
  };
  session: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    expiresAt?: number;
  } | null;
}

export interface GoogleOAuthResponse {
  url: string;
}

class AuthService {
  /**
   * Register a new user with email/password
   */
  async signUp(data: SignUpData): Promise<AuthResponse> {
    const { email, password } = data;

    // Use admin client for server-side signup to avoid rate limits
    const { data: authData, error } = await supabaseAdmin.auth.admin.createUser(
      {
        email,
        password,
        email_confirm: true, // Auto-confirm email for API signups
      },
    );

    if (error) {
      if (error.message.includes("already been registered")) {
        throw ApiError.badRequest("Email already registered");
      }
      throw ApiError.badRequest(error.message);
    }

    if (!authData.user) {
      throw ApiError.internal("Failed to create user");
    }

    // User created - they need to sign in to get a session
    return {
      user: {
        id: authData.user.id,
        email: authData.user.email ?? "",
        createdAt: authData.user.created_at,
      },
      session: null,
    };
  }

  /**
   * Sign in with email/password
   */
  async signIn(data: SignInData): Promise<AuthResponse> {
    const { email, password } = data;

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        throw ApiError.unauthorized("Invalid email or password");
      }
      if (error.message.includes("rate limit")) {
        throw new ApiError("Too many requests. Please try again later.", 429);
      }
      throw ApiError.unauthorized(error.message);
    }

    if (!authData.user || !authData.session) {
      throw ApiError.internal("Failed to sign in");
    }

    return {
      user: {
        id: authData.user.id,
        email: authData.user.email!,
        createdAt: authData.user.created_at,
      },
      session: {
        accessToken: authData.session.access_token,
        refreshToken: authData.session.refresh_token,
        expiresIn: authData.session.expires_in,
        expiresAt: authData.session.expires_at,
      },
    };
  }

  /**
   * Get Google OAuth URL for sign in
   * Client should redirect user to this URL, then handle the callback
   */
  async getGoogleOAuthUrl(redirectTo: string): Promise<GoogleOAuthResponse> {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      throw ApiError.internal(error.message);
    }

    if (!data.url) {
      throw ApiError.internal("Failed to generate OAuth URL");
    }

    return { url: data.url };
  }

  /**
   * Sign out - invalidate the session
   */
  async signOut(accessToken: string): Promise<void> {
    // Use admin to sign out user by their JWT
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      throw ApiError.unauthorized("Invalid token");
    }

    // Sign out all sessions for this user (optional: use scope: 'local' for single session)
    const { error } = await supabaseAdmin.auth.admin.signOut(
      accessToken,
      "global",
    );

    if (error) {
      throw ApiError.internal(error.message);
    }
  }

  /**
   * Refresh the access token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const { data: authData, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      throw ApiError.unauthorized("Invalid or expired refresh token");
    }

    if (!authData.user || !authData.session) {
      throw ApiError.internal("Failed to refresh token");
    }

    return {
      user: {
        id: authData.user.id,
        email: authData.user.email!,
        createdAt: authData.user.created_at,
      },
      session: {
        accessToken: authData.session.access_token,
        refreshToken: authData.session.refresh_token,
        expiresIn: authData.session.expires_in,
        expiresAt: authData.session.expires_at,
      },
    };
  }

  /**
   * Verify a token and get user info
   */
  async verifyToken(accessToken: string) {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      throw ApiError.unauthorized("Invalid or expired token");
    }

    return {
      id: user.id,
      email: user.email!,
      createdAt: user.created_at,
    };
  }
}

export const authService = new AuthService();
