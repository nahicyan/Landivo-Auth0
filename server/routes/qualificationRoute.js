// server/routes/qualificationRoute.js
import express from "express";
import { 
  createQualification, 
  getQualificationsForProperty,
  getAllQualifications
} from "../controllers/qualificationCntrl.js";
import { 
  jwtCheck, 
  extractUserFromToken, 
  checkPermissions 
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create a new qualification entry - no special permissions required
// Just authentication is enough as any user can submit qualification
router.post("/create", jwtCheck, extractUserFromToken, createQualification);

// Get qualifications for a specific property - requires read:qualifications permission
router.get("/property/:propertyId", 
  jwtCheck, 
  extractUserFromToken, 
  checkPermissions(['read:qualifications']), 
  getQualificationsForProperty
);

// Get all qualifications with pagination and filtering - requires read:qualifications permission
router.get("/all", 
  jwtCheck, 
  extractUserFromToken, 
  checkPermissions(['read:qualifications']), 
  getAllQualifications
);

export { router as qualificationRoute };