export interface LoginFormValues {
    email: string;
    password: string;
}

type LoginFieldName = keyof LoginFormValues;

export type LoginFieldErrors = Partial<Record<LoginFieldName, string>>;

export const DEFAULT_LOGIN_FORM_ERROR =
    "Something went wrong. Please try again.";

const loginFieldMessageMap: Record<string, LoginFieldName> = {
    "Email is required": "email",
    "Password is required": "password",
};

const passwordResetMessageSet = new Set([
    "Invalid email or password",
    "Your account has been banned.",
    "Account is temporarily locked. Try again later.",
]);

export function createLoginFormValues(): LoginFormValues {
    return {
        email: "",
        password: "",
    };
}

export function normalizeLoginFormValues(
    values: LoginFormValues,
): LoginFormValues {
    return {
        email: values.email.trim(),
        password: values.password,
    };
}

export function validateLoginFormValues(
    values: LoginFormValues,
): LoginFieldErrors {
    const errors: LoginFieldErrors = {};

    if (!values.email.trim()) {
        errors.email = "Email is required";
    }

    if (!values.password.trim()) {
        errors.password = "Password is required";
    }

    return errors;
}

export function getLoginFieldError(message: string) {
    return loginFieldMessageMap[message];
}

export function shouldResetLoginPassword(message: string) {
    return passwordResetMessageSet.has(message);
}
