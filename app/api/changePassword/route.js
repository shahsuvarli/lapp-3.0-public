import { authOptions } from "utils/auth";
import { connection } from "utils/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs"; // Make sure bcryptjs is installed

export async function POST(req) {
  const { user } = await getServerSession(authOptions);
  const { currentPassword, newPassword, confirmPassword } = await req.json();

  // Validate password match
  if (newPassword !== confirmPassword) {
    return NextResponse.json({
      message: "New passwords do not match",
      status: 400,
      success: false,
    });
  }

  // Password strength validation (optional)
  if (newPassword.length < 8) {
    return NextResponse.json({
      message: "New password must be at least 8 characters long",
      status: 400,
      success: false,
    });
  }

  try {
    const request = connection.request();

    // Get the current hashed password from the database
    request.input("employee_id", user.id);
    const result = await request.query(
      `SELECT password FROM employees WHERE employee_id = @employee_id`
    );

    if (result.recordset.length === 0) {
      return NextResponse.json({
        message: "User not found",
        status: 404,
        success: false,
      });
    }

    const dbPassword = result.recordset[0].password;

    // Compare the current password with the database password (hashed)
    const isMatch = await bcrypt.compare(currentPassword, dbPassword);

    if (!isMatch) {
      return NextResponse.json({
        message: "Current password is incorrect",
        status: 400,
        success: false,
      });
    }

    // Hash the new password before updating the database
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    request.input("newPassword", hashedNewPassword);
    const updateResult = await request.query(
      `UPDATE employees SET password = @newPassword WHERE employee_id = @employee_id`
    );

    // Check if the password update was successful
    if (updateResult.rowsAffected[0] > 0) {
      return NextResponse.json({
        message: "Password updated successfully",
        status: 200,
        success: true,
      });
    } else {
      return NextResponse.json({
        message: "Failed to update password",
        status: 500,
        success: false,
      });
    }
  } catch (error) {
    console.error("Error updating password:", error);
    return NextResponse.json({
      message: "Internal server error",
      status: 500,
      success: false,
    });
  }
}
