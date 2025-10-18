import { createServerSupabaseClient } from './supabase-server'
import { createClient } from './supabase-client'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { SupabaseAdapter } from '@next-auth/supabase-adapter'


// Helper function to get the current user from Supabase
export async function getCurrentUser() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    // Get additional user profile data from the users table
    const { data: profile } = await (supabase as any)
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    return {
      id: user.id,
      email: user.email!,
      name: profile?.name || (user.user_metadata as any)?.name || '',
      avatar: profile?.avatar || (user.user_metadata as any)?.avatar_url || '',
      user_type: profile?.user_type || 'creator',
      is_verified: profile?.is_verified || false,
      phone_verified: profile?.phone_verified || false,
      profile: profile || null,
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// Helper function to require authentication
export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('Authentication required')
  }

  return user
}

// Helper function to check if user is a creator
export async function requireCreator() {
  const user = await requireAuth()

  if (user.user_type !== 'creator') {
    throw new Error('Creator access required')
  }

  return user
}

// Helper function to check if user is an investor
export async function requireInvestor() {
  const user = await requireAuth()

  if (user.user_type !== 'investor') {
    throw new Error('Investor access required')
  }

  return user
}

// Helper function to create or update user profile
export async function upsertUserProfile(userData: {
  email: string
  name: string
  phone_number?: string
  user_type: 'creator' | 'investor'
  avatar?: string
  authUserId: string // Require the Supabase Auth user ID
}) {
  try {
    const supabase = await createServerSupabaseClient()

    // First try to find existing user
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', userData.email)
      .single()

    let result: any

    if (existingUser) {
      // Update existing user - use type assertion for now
      const { data, error } = await (supabase as any)
        .from('users')
        .update({
          name: userData.name,
          phone_number: userData.phone_number,
          user_type: userData.user_type,
          avatar: userData.avatar,
          updated_at: new Date().toISOString(),
        })
        .eq('email', userData.email)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update user profile: ${error.message}`)
      }
      result = data
    } else {
      // Create new user profile using the Supabase Auth user ID
      const { data, error } = await (supabase as any)
        .from('users')
        .insert({
          id: userData.authUserId, // Use Supabase Auth user ID
          email: userData.email,
          name: userData.name,
          phone_number: userData.phone_number,
          user_type: userData.user_type,
          avatar: userData.avatar,
          is_verified: false,
          phone_verified: false,
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create user profile: ${error.message}`)
      }
      result = data
    }

    return result
  } catch (error) {
    console.error('Error upserting user profile:', error)
    throw error
  }
}

// NextAuth.js configuration
export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: "google",
      name: "Google",
      type: "oauth",
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      wellKnown: "https://accounts.google.com/.well-known/openid_configuration",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
      profile: (profile: any) => {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        }
      },
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      type: "oauth",
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      wellKnown: "https://www.linkedin.com/oauth/.well-known/openid_configuration",
      authorization: {
        params: {
          response_type: "code",
          scope: "openid profile email"
        }
      },
      profile: (profile: any) => {
        return {
          id: profile.sub || profile.id,
          name: profile.name || `${profile.given_name || ''} ${profile.family_name || ''}`.trim() || profile.email,
          email: profile.email,
          image: profile.picture,
        }
      },
    },
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const supabase = await createServerSupabaseClient();

          // Sign in with Supabase Auth
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (error || !data.user) {
            console.error('Credentials auth error:', error?.message);
            return null;
          }

          // Get user profile from our users table
          const { data: profile } = await (supabase as any)
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

          return {
            id: data.user.id,
            email: data.user.email,
            name: profile?.name || data.user.email?.split('@')[0] || 'User',
            image: profile?.avatar,
            user_type: profile?.user_type || 'creator',
            is_verified: profile?.is_verified || false,
            phone_verified: profile?.phone_verified || false,
          };
        } catch (error) {
          console.error('Error in credentials authorize:', error);
          return null;
        }
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Create or update user profile in our database
        if (user.email && user.name) {
          const supabase = await createServerSupabaseClient()

          // Check if user exists
          const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', user.email)
            .single()

          if (!existingUser) {
            // Create new user profile with current user's auth ID
            // Get the current authenticated user from the session context
            const { data: { user: currentAuthUser }, error: authError } = await supabase.auth.getUser()

            if (authError || !currentAuthUser) {
              console.error('Error getting current auth user for profile creation:', authError)
              return false
            }

            const { data, error } = await (supabase as any)
              .from('users')
              .insert({
                id: currentAuthUser.id, // Use current authenticated user's ID
                email: user.email,
                name: user.name,
                avatar: user.image,
                is_verified: true, // OAuth users are pre-verified
                phone_verified: false,
                user_type: 'creator', // Default, can be changed later
              })
              .select()
              .single()

            if (error) {
              console.error('Error creating OAuth user profile:', error)
              return false
            }
          } else {
            // Update existing user with latest info
            await (supabase as any)
              .from('users')
              .update({
                name: user.name,
                avatar: user.image,
                updated_at: new Date().toISOString(),
              })
              .eq('email', user.email)
          }
        }

        return true
      } catch (error) {
        console.error('Error in signIn callback:', error)
        return false
      }
    },
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token
        token.provider = account.provider
      }
      return token
    },
    async session({ session, token }) {
       if (session.user && session.user.email) {
         try {
           // Get additional user data from our users table
           const supabase = await createServerSupabaseClient()
           const { data: profile } = await (supabase as any)
             .from('users')
             .select('*')
             .eq('email', session.user.email)
             .single()

           if (profile) {
             session.user.name = profile.name
             session.user.image = profile.avatar
             ;(session.user as any).user_type = profile.user_type
             ;(session.user as any).is_verified = profile.is_verified
             ;(session.user as any).phone_verified = profile.phone_verified
             ;(session.user as any).id = profile.id
             ;(session.user as any).tenant_id = profile.tenant_id
           }
         } catch (error) {
           console.error('Error fetching user profile in session callback:', error)
         }
       }
       return session
     },
  },
}
