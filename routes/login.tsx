// routes/login.tsx
import { Handlers, PageProps } from "$fresh/server.ts";
import { authenticateUser, createJWT } from "../utils/auth.ts";

type LoginData = {
  error?: string;
};

export const handler: Handlers<LoginData> = {
  GET(_, ctx) {
    return ctx.render({});
  },

  async POST(req, ctx) {
    const form = await req.formData();
    const email = form.get("email")?.toString() || "";
    const password = form.get("password")?.toString() || "";

    const user = await authenticateUser(email, password);

    if (!user) {
      return ctx.render({ error: "Invalid email or password" });
    }

    // Create a JWT token
    const token = await createJWT(user);

    // Set the token as a cookie
    const headers = new Headers();
    headers.set("Location", "/dashboard");
    headers.set(
      "Set-Cookie",
      `auth_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`,
    );

    return new Response("", {
      status: 303,
      headers,
    });
  },
};

export default function Login({ data }: PageProps<LoginData>) {
  const { error } = data;

  return (
    <div class="min-h-screen bg-gray-50 flex items-center justify-center">
      <div class="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="hidden md:flex flex-col justify-center px-12 py-16 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-l-lg text-white">
          <div class="max-w-lg">
            <h2 class="text-4xl font-extrabold">Welcome back</h2>
            <p class="mt-4 text-indigo-100">
              Sign in to manage your MOUs, check milestones and collaborate with
              partners.
            </p>

            <div class="mt-8">
              <a
                href="/signup"
                class="inline-block mr-3 px-4 py-2 border border-white/30 rounded-md text-sm"
              >
                Sign up
              </a>
              <a
                href="/"
                class="inline-block px-4 py-2 bg-white text-indigo-700 rounded-md shadow"
              >
                Explore
              </a>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-center px-6 py-12">
          <div class="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
            <div class="text-center">
              <h1 class="text-2xl font-bold text-gray-900">
                Sign in to your account
              </h1>
              <p class="mt-2 text-sm text-gray-600">
                Enter your credentials to continue.
              </p>
            </div>

            {error && (
              <div class="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <form method="POST" class="mt-8 space-y-6">
              <div>
                <label
                  for="email"
                  class="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  class="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label
                  for="password"
                  class="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  class="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                class="w-full mt-2 inline-flex justify-center py-2 px-4 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700"
              >
                Login
              </button>
            </form>

            <div class="mt-4 text-center text-sm">
              <span class="text-gray-600">Don't have an account?</span>
              <a href="/signup" class="ml-2 text-indigo-600 hover:underline">
                Sign up
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
