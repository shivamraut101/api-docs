import * as React from "react";

interface ForgotPasswordEmailProps {
  name: string;
  email: string;
  tempPassword: string;
  loginUrl: string;
}

export const ForgotPasswordEmail: React.FC<ForgotPasswordEmailProps> = ({
  name,
  email,
  tempPassword,
  loginUrl,
}) => (
  <div
    style={{
      fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif',
      backgroundColor: "#f9fafb",
      padding: "40px 20px",
      color: "#111827",
    }}
  >
    <div
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        padding: "40px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <img
          src="https://primex-api-docs.vercel.app/logo.png"
          alt="Primexmeta"
          style={{ height: "40px", width: "auto" }}
        />
      </div>

      <p style={{ fontSize: "16px", lineHeight: "24px", marginBottom: "24px" }}>
        Hello <strong>{name}</strong>,
      </p>

      <p style={{ fontSize: "16px", lineHeight: "24px", marginBottom: "24px" }}>
        We received a request to reset your password. We have generated a temporary password for you
        to log in.
      </p>

      <div
        style={{
          backgroundColor: "#f3f4f6",
          borderRadius: "8px",
          padding: "24px",
          marginBottom: "32px",
        }}
      >
        <div style={{ marginBottom: "12px" }}>
          <span
            style={{ color: "#6b7280", fontSize: "14px", display: "block", marginBottom: "4px" }}
          >
            Email
          </span>
          <strong style={{ fontSize: "16px" }}>{email}</strong>
        </div>
        <div>
          <span
            style={{ color: "#6b7280", fontSize: "14px", display: "block", marginBottom: "4px" }}
          >
            Temporary Password
          </span>
          <strong style={{ fontSize: "16px", fontFamily: "monospace", letterSpacing: "1px" }}>
            {tempPassword}
          </strong>
        </div>
      </div>

      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <a
          href={loginUrl}
          style={{
            backgroundColor: "#0f172a",
            color: "#ffffff",
            padding: "12px 32px",
            borderRadius: "6px",
            textDecoration: "none",
            fontWeight: "600",
            fontSize: "16px",
            display: "inline-block",
          }}
        >
          Login with Temporary Password
        </a>
      </div>

      <p style={{ fontSize: "14px", lineHeight: "20px", color: "#6b7280", fontStyle: "italic" }}>
        Note: You will be required to change your password immediately after logging in for security
        reasons.
      </p>

      <hr style={{ border: "0", borderTop: "1px solid #e5e7eb", margin: "32px 0" }} />

      <p style={{ fontSize: "12px", color: "#9ca3af", textAlign: "center", margin: "0" }}>
        © {new Date().getFullYear()} Primexmeta. All rights reserved.
      </p>
    </div>
  </div>
);
