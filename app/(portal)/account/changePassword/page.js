"use client";

import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { enqueueSnackbar } from "notistack";
import { useRouter } from "next/navigation";
import { ImSpinner2 } from "react-icons/im";

export default async function Page() {
  const router = useRouter();
  const validationSchema = Yup.object().shape({
    currentPassword: Yup.string().required("Current Password is required"),
    newPassword: Yup.string()
      .required("New Password is required")
      .min(8, "Password must be at least 8 characters")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[0-9]/, "Password must contain at least one number")
      .matches(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
      .required("Confirm Password is required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const onSubmit = async (formData) => {
    try {
      const {
        data: { message, success },
      } = await axios.post("/api/changePassword", formData);
      if (success) {
        enqueueSnackbar(message, {
          variant: "success",
        });
        reset();
        router.push("/dashboard");
      } else {
        enqueueSnackbar(message, { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar(message, { variant: "error" });
    }
  };

  return (
    <div className="flex flex-col gap-5 animate-[rise_1s_ease-in-out] lg:w-[calc(100%-310px)] w-full bg-[#f7f6f3] p-4 rounded-md">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col">
          <label htmlFor="currentPassword">Current Password</label>
          <input
            type="password"
            id="currentPassword"
            {...register("currentPassword")}
            className="p-2 border border-gray-300 rounded"
          />
          {errors.currentPassword && (
            <span className="text-red-500">
              {errors.currentPassword.message}
            </span>
          )}
        </div>

        <div className="flex flex-col">
          <label htmlFor="newPassword">New Password</label>
          <input
            type="password"
            id="newPassword"
            {...register("newPassword")}
            className="p-2 border border-gray-300 rounded"
          />
          {errors.newPassword && (
            <span className="text-red-500">{errors.newPassword.message}</span>
          )}
        </div>

        <div className="flex flex-col">
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input
            type="password"
            id="confirmPassword"
            {...register("confirmPassword")}
            className="p-2 border border-gray-300 rounded"
          />
          {errors.confirmPassword && (
            <span className="text-red-500">
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-700 flex flex-row justify-center items-center"
        >
          {isSubmitting ? (
            <ImSpinner2 className="animate-spin" size={20} />
          ) : (
            "Change Password"
          )}
        </button>
      </form>
    </div>
  );
}
