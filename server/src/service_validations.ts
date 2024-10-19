import { ValidityResponse } from "./entities/validity_response.js";

export const validateGetTracksRequest = (
  title?: string | null,
  start?: string | null,
  limit?: string | null
): ValidityResponse => {
  if (title === "") {
    return new ValidityResponse(false, "Invalid title");
  }
  if (typeof start === "string" && isNaN(parseInt(start))) {
    return new ValidityResponse(false, "`start` must be a valid integer");
  }
  if (
    typeof limit === "string" &&
    (isNaN(parseInt(limit)) || parseInt(limit) === 0)
  ) {
    return new ValidityResponse(
      false,
      "`limit` must be a valid integer greater than 0."
    );
  }
  return new ValidityResponse(true);
};
