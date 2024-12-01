"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSnackbar } from "notistack";
import { ImSpinner } from "react-icons/im";
import Image from "next/image";
import { FaSpinner } from "react-icons/fa";

export default function LoginPage() {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const { data: status } = useSession();

  const validationSchema = Yup.object().shape({
    email: Yup.string().email("*Invalid email").required("*Required"),
    password: Yup.string().required("*Required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const onSubmit = async (data) => {
    try {
      const response = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false, // Use redirect:false so you can handle manually
      });

      if (response?.ok) {
        enqueueSnackbar("Signed in successfully!", { variant: "success" });
        router.push("/projects/create");
      } else {
        enqueueSnackbar("Failed to login. Check your credentials.", {
          variant: "error",
        });
      }
    } catch (error) {
      enqueueSnackbar("Login failed: Unexpected error occurred", {
        variant: "error",
      });
    }
  };

  // Redirect if already signed in
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/projects/create");
    }
  }, [status, router]);

  if (status === "loading") {
    return <FaSpinner className="animate-spin" />; // Show a loading indicator while checking session status
  }

  return (
    <main className="flex justify-center items-center flex-col">
      <div className="flex flex-row gap-8 bg-white border border-slate-200 px-8 py-4 rounded-md">
        <span className="w-full md:flex justify-center border-r border-r-slate-200 pr-8 hidden items-center">
          <Image
            src="/logo.png"
            height={200}
            width={500}
            priority
            alt="logo"
            className="w-[300px] h-auto object-contain"
          />
        </span>
        <div className="flex flex-col bg-white rounded-md min-w-[350px] min-h-[#400px] gap-4">
          <h1 className="text-slate-600 mb-4 text-center text-2xl">Login</h1>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-8 justify-between text-slate-600"
          >
            <div className="w-full flex flex-col gap-2">
              <label
                className="flex flex-row gap-2 text-md items-center justify-between"
                htmlFor="email"
              >
                <p className="text-lg">Email</p>
                <p className="text-red-500">
                  {errors.email ? `${errors.email.message}` : ""}
                </p>
              </label>
              <input
                type="email"
                id="email"
                placeholder="Email"
                autoComplete="true"
                className="w-full h-12 border border-solid border-slate-400 p-2 rounded-md"
                {...register("email")}
              />
            </div>

            <div className="w-full flex flex-col gap-2">
              <label
                className="flex flex-row gap-2 text-md items-center justify-between"
                htmlFor="password"
              >
                <p className="text-lg">Password</p>
                <p className="text-red-500">
                  {errors.password ? `${errors.password.message}` : ""}
                </p>
              </label>
              <input
                type="password"
                id="password"
                placeholder="Password"
                className="w-full h-12 border border-solid border-slate-400 p-2 rounded-md"
                {...register("password")}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-12 rounded-md border-none bg-[#0366ff] text-white text-lg flex justify-center items-center gap-2 hover:cursor-pointer hover:bg-[#0757d0]"
            >
              {isSubmitting ? (
                <ImSpinner size={20} className="animate-spin" />
              ) : (
                "Login"
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
