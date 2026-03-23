export interface RegisterFormValues {
    name: string;
    email: string;
    password: string;
}

type RegisterFieldName = keyof RegisterFormValues;

export type RegisterFieldErrors = Partial<Record<RegisterFieldName, string>>;

export const DEFAULT_REGISTER_FORM_ERROR =
    "Something went wrong. Please try again.";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const registerFieldMessageMap: Record<string, RegisterFieldName> = {
    "Name is required": "name",
    "Email is required": "email",
    "Email is invalid": "email",
    "Email already exists": "email",
    "Password is required": "password",
    "Password must be at least 8 characters long": "password",
};

export function createRegisterFormValues(): RegisterFormValues {
    return {
        name: "",
        email: "",
        password: "",
    };
}

export function normalizeRegisterFormValues(
    values: RegisterFormValues,
): RegisterFormValues {
    return {
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
    };
}

export function validateRegisterFormValues(
    values: RegisterFormValues,
): RegisterFieldErrors {
    const errors: RegisterFieldErrors = {};
    const trimmedPassword = values.password.trim();

    if (!values.name) {
        errors.name = "Name is required";
    }

    if (!values.email) {
        errors.email = "Email is required";
    } else if (!emailPattern.test(values.email)) {
        errors.email = "Email is invalid";
    }

    if (!trimmedPassword) {
        errors.password = "Password is required";
    } else if (values.password.length < 8) {
        errors.password = "Password must be at least 8 characters long";
    }

    return errors;
}

export function getRegisterFieldError(message: string) {
    return registerFieldMessageMap[message];
}
