import { radius } from "@/constants/token/radius";
import { spacing } from "@/constants/token/spacing";

export const getSpacing = (key: keyof typeof spacing) => parseFloat(spacing[key]);
export const getRadius = (key: keyof typeof radius) => parseFloat(radius[key]);
