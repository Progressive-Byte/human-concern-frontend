const REQUIRED = [
  "organization", "firstName", "lastName", "email",
  "addressLine1", "streetName", "city", "state", "postalCode", "country",
];

const LABELS = {
  organization: "Organization name",
  firstName: "First name",
  lastName: "Last name",
  email: "Email address",
  addressLine1: "Address",
  streetName: "Street name",
  city: "City",
  state: "State / province",
  postalCode: "Postal code",
  country: "Country",
};

export function validateRegister(values) {
  const errors = {};

  for (const key of REQUIRED) {
    if (!values[key]?.trim()) errors[key] = `${LABELS[key]} is required`;
  }

  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
    errors.email = "Enter a valid email address";

  if (!values.password) errors.password = "Password is required";
  else if (values.password.length < 8) errors.password = "Password must be at least 8 characters";

  if (!values.confirmPassword) errors.confirmPassword = "Please confirm your password";
  else if (values.confirmPassword !== values.password) errors.confirmPassword = "Passwords do not match";

  if (!values.terms) errors.terms = "You must accept the terms to continue";

  return errors;
}
