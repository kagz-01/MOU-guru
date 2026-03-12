// routes/signup.tsx
import { Handlers, PageProps } from "$fresh/server.ts";

export const handler: Handlers = {
  GET(_, ctx) {
    return ctx.render();
  },
};

export default function Signup(_props: PageProps) {
  return (
    <div class="min-h-screen bg-gray-50 flex items-center justify-center">
      <div class="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left decorative panel */}
        <div class="hidden md:flex flex-col justify-center px-12 py-16 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-l-lg text-white">
          <div class="max-w-lg">
            <h2 class="text-4xl font-extrabold">
              Manage your agreements with confidence
            </h2>
            <p class="mt-4 text-indigo-100">
              Create, sign and monitor MOUs. Keep stakeholders aligned, track
              milestones and generate reports — all in one place.
            </p>

            <div class="mt-8">
              <a
                href="/login"
                class="inline-block mr-3 px-4 py-2 border border-white/30 rounded-md text-sm"
              >
                Log in
              </a>
              <a
                href="/signup"
                class="inline-block px-4 py-2 bg-white text-indigo-700 rounded-md shadow"
              >
                Sign up
              </a>
            </div>
          </div>

          <div class="mt-10 opacity-90">
            {/* Simple illustrative SVG */}
            <svg
              viewBox="0 0 600 400"
              class="w-full h-48"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
            >
              <defs>
                <linearGradient id="g1" x1="0" x2="1">
                  <stop offset="0" stop-color="rgba(255,255,255,0.18)" />
                  <stop offset="1" stop-color="rgba(255,255,255,0.06)" />
                </linearGradient>
              </defs>
              <rect
                x="20"
                y="20"
                rx="16"
                width="560"
                height="240"
                fill="url(#g1)"
              />
            </svg>
          </div>
        </div>

        {/* Right form panel */}
        <div class="flex items-center justify-center px-6 py-12">
          <div class="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
            <div class="text-center">
              <h1 class="text-2xl font-bold text-gray-900">
                Create your account
              </h1>
              <p class="mt-2 text-sm text-gray-600">
                Get started — it only takes a minute.
              </p>
            </div>

            <form
              method="POST"
              action="/api/auth/signup"
              class="mt-8 space-y-6"
            >
              <div>
                <label
                  for="name"
                  class="block text-sm font-medium text-gray-700"
                >
                  Full name
                </label>
                <input
                  id="name"
                  name="name"
                  required
                  class="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label
                  for="email"
                  class="block text-sm font-medium text-gray-700"
                >
                  Work email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
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
                  id="password"
                  name="password"
                  type="password"
                  required
                  class="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                class="w-full mt-2 inline-flex justify-center py-2 px-4 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700"
              >
                Create account
              </button>

              <div class="mt-4 text-center text-sm">
                <span class="text-gray-600">Already registered?</span>
                <a href="/login" class="ml-2 text-indigo-600 hover:underline">
                  Log in
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
