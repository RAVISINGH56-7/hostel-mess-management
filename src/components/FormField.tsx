import { forwardRef } from "react";

type FormFieldProps = {
  label: string;
  type?: string;
  name: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  error?: string;
};

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, type = "text", name, placeholder, autoComplete, required = true, error, ...props }, ref) => {
    return (
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-ink-soft">
          {label}
        </span>
        <input
          ref={ref}
          type={type}
          name={name}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className={`w-full rounded-xl border bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-soft/60 transition-colors focus:outline-none focus:ring-2 ${
            error
              ? "border-brick focus:ring-brick/20"
              : "border-line focus:border-curry focus:ring-curry/20"
          }`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-brick">{error}</p>}
      </label>
    );
  }
);
FormField.displayName = "FormField";

export default FormField;