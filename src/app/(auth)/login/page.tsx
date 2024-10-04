"use client"; // Indicates that this component is a client-side component in Next.js.

import Button from "@/components/Button"; // Importing a custom Button component from the UI library.
import { FC, useState } from "react"; // Importing FC (Functional Component) type and useState hook from React.
import { signIn } from "next-auth/react"; // Importing the signIn function from next-auth for authentication.
import { toast } from "react-hot-toast"; // Importing the toast function for displaying notifications.

const Page: FC = () => {
  // Defining the functional component named Page.
  const [isLoading, setIsLoading] = useState<boolean>(false); // State to manage loading status during sign-in.

  // Function to handle login using Google.
  async function loginWithGoogle() {
    setIsLoading(true); // Set loading to true to indicate the login process has started.
    try {
      await signIn("google"); // Attempt to sign in using Google authentication.
    } catch (error) {
      // If an error occurs, display an error message to the user.
      toast.error("Something went wrong with your login.");
    } finally {
      setIsLoading(false); // Reset loading state regardless of success or failure.
    }
  }

  return (
    <>
      {/* Main container for the sign-in form */}
      <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full flex flex-col items-center max-w-md space-y-8">
          <div className="flex flex-col items-center gap-2 text-black text-2xl">
            Chat Application
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Sign in to your account
            </h2>
          </div>

          {/* Google Sign-in Button */}
          <Button
            isLoading={isLoading}
            type="button" // Button type set to button to prevent default form submission.
            className="max-w-sm mx-auto w-full"
            onClick={loginWithGoogle}
          >
            {isLoading ? null : ( // Display loading spinner if isLoading is true.
              <svg
                className="mr-2 h-4 w-4"
                aria-hidden="true"
                focusable="false"
                data-prefix="fab"
                data-logo="github"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                {/* SVG paths for Google logo */}
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4" // Fill color for the path.
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path d="M1 1h22v22H1z" fill="none" />{" "}
              </svg>
            )}
            Google
          </Button>
        </div>
      </div>
    </>
  );
};

export default Page;
