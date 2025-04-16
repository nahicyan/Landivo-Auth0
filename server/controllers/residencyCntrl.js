import asyncHandler from "express-async-handler";
import { prisma } from '../config/prismaConfig.js';

  export const createResidency = asyncHandler(async (req, res) => {
    const {
      ownerId,
      featured,
      featuredWeight,
      apnOrPin,
      status,
      title,
      description,
      direction,
      type,
      legalDescription,
      zoning,
      restrictions,
      mobileHomeFriendly,
      hoaPaymentTerms,
      hoaPoa,
      survey,
      hoaFee,
      notes,
  
      // Address and Location
      streetAddress,
      city,
      county,
      state,
      zip,
      latitude,
      longitude,
      area,
      landIdLink,
  
      // Physical Attributes
      sqft,
      acre,
      image,
  
      // Pricing and Financing
      askingPrice,
      minPrice,
      disPrice,

      // Financing and Payment Calculation
      financing,
      tax,
      hoaMonthly,
      serviceFee,
      term,
      interestOne,
      interestTwo,
      interestThree,
      monthlyPaymentOne,
      monthlyPaymentTwo,
      monthlyPaymentThree,
      downPaymentOne,
      downPaymentTwo,
      downPaymentThree,
      loanAmountOne,
      loanAmountTwo,
      loanAmountThree,
      purchasePrice,
      financedPrice,


      // Utilities and Infrastructure
      water,
      sewer,
      electric,
      roadCondition,
      floodplain,
  
      // Miscellaneous
      ltag,
      rtag,
      landId,
  
      // User Information
      userEmail,
    } = req.body.data;
  
    try {
      const lowerCaseEmail = userEmail.toLowerCase(); // Normalize email
  
      // Check if the user exists
      const user = await prisma.user.findUnique({
        where: { email: lowerCaseEmail },
      });
  
      if (!user) {
        return res.status(404).send({ message: "User not found." });
      }
  
      // Check for existing property with unique constraints
      const existingProperty = await prisma.residency.findFirst({
        where: {
          OR: [
            { apnOrPin },
            {
              streetAddress,
              city,
              state,
              userEmail: lowerCaseEmail,
            },
            {
              latitude: parseFloat(latitude),
              longitude: parseFloat(longitude),
            },
          ],
        },
      });
  
      if (existingProperty) {
        return res.status(400).send({ message: "This property already exists in the system." });
      }
  
      // Create the property with provided data
      const residency = await prisma.residency.create({
        data: {
          ownerId,
          featured: featured ?? "No",
          featuredWeight: featuredWeight ? parseInt(featuredWeight, 10) : null,
          apnOrPin,
          status: status ?? "Available",
          title,
          description: description ?? null,
          direction: direction ?? null,
          type: type ?? null,
          legalDescription: legalDescription ?? null,
          zoning: zoning ?? null,
          restrictions: restrictions ?? null,
          mobileHomeFriendly: mobileHomeFriendly ?? null,
          hoaPoa: hoaPoa ?? null,
          hoaFee: hoaFee ?? null,
          hoaPaymentTerms: hoaPaymentTerms ?? null,
          notes: notes ?? null,
          survey: survey ?? null,
  
          // Address and Location
          streetAddress,
          city,
          county,
          state,
          zip,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          area: area ?? null,
          landIdLink: landIdLink ?? null,
  
          // Physical Attributes
          sqft,
          acre: acre ?? null,
          image: image ?? null,
  
          // Pricing and Financing
          askingPrice,
          minPrice,
          disPrice: disPrice ?? null,


          // Financing and Payment Calculation
          financing: financing ?? "Not-Available",
          tax: tax ?? null,
          hoaMonthly: hoaMonthly ?? null,
          serviceFee: serviceFee ?? null,
          term: term ? parseInt(term, 10) : null,
          interestOne: interestOne ?? null,
          interestTwo: interestTwo ?? null,
          interestThree: interestThree ?? null,
          monthlyPaymentOne: monthlyPaymentOne ?? null,
          monthlyPaymentTwo: monthlyPaymentTwo ?? null,
          monthlyPaymentThree: monthlyPaymentThree ?? null,
          downPaymentOne: downPaymentOne ?? null,
          downPaymentTwo: downPaymentTwo ?? null,
          downPaymentThree: downPaymentThree ?? null,
          loanAmountOne: loanAmountOne ?? null,
          loanAmountTwo: loanAmountTwo ?? null,
          loanAmountThree: loanAmountThree ?? null,
          purchasePrice: purchasePrice ?? null,
          financedPrice: financedPrice ?? null,
        
  
          // Utilities and Infrastructure
          water: water ?? null,
          sewer: sewer ?? null,
          electric: electric ?? null,
          roadCondition: roadCondition ?? null,
          floodplain: floodplain ?? null,
  
          // Miscellaneous
          ltag: ltag ?? null,
          rtag: rtag ?? null,
          landId: landId ?? "Not-Available",
  
          // Relate to the user
          owner: {
            connect: { email: lowerCaseEmail },
          },
        },
      });
  
      res.status(201).send({
        message: "Property Added Successfully",
        residency,
      });
  
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: "An error occurred", error: err.message });
    }
  });
  
//Get All Property
export const getAllResidencies = asyncHandler(async (req, res) => {
    try {
      const residencies = await prisma.residency.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });
      res.status(200).send(residencies);
    } catch (error) {
      console.error("Error fetching residencies:", error);
      res.status(500).send({ message: "An error occurred while fetching residencies", error: error.message });
    }
  });
//Get A Certain Property

export const getResidency= asyncHandler(async(req,res)=>{
    const {id} = req.params;
    try{

        const residency = await prisma.residency.findUnique({
            where: {id:id}
        })
        res.send(residency);
    }
    catch(err){
        throw new Error(err.message);
    }
});




export const updateResidency = asyncHandler(async (req, res) => {
  console.log("Received updateResidency request body:", req.body);
  try {
    const { id } = req.params;
    let { currentUser, userEmail, imageUrls, viewCount, ...restOfData } = req.body;

    // Remove non-updatable fields.
    delete restOfData.id;
    delete restOfData.createdAt;
    delete restOfData.updatedAt;

    if (restOfData.ownerId) restOfData.ownerId = parseInt(restOfData.ownerId, 10);
    if (restOfData.featuredWeight) restOfData.featuredWeight = parseInt(restOfData.featuredWeight, 10);
    if (restOfData.latitude) restOfData.latitude = parseFloat(restOfData.latitude);
    if (restOfData.longitude) restOfData.longitude = parseFloat(restOfData.longitude);
    if (restOfData.sqft) restOfData.sqft = parseInt(restOfData.sqft, 10);
    if (restOfData.askingPrice) restOfData.askingPrice = parseFloat(restOfData.askingPrice);
    if (restOfData.minPrice) restOfData.minPrice = parseFloat(restOfData.minPrice);
    if (restOfData.disPrice) restOfData.disPrice = parseFloat(restOfData.disPrice);
    if (restOfData.acre) restOfData.acre = parseFloat(restOfData.acre);
    if (restOfData.hoaFee) restOfData.hoaFee = parseFloat(restOfData.hoaFee);
    // Payment Fields
    if (restOfData.tax) restOfData.tax = parseFloat(restOfData.tax);
    if (restOfData.hoaMonthly) restOfData.hoaMonthly = parseFloat(restOfData.hoaMonthly);
    if (restOfData.serviceFee) restOfData.serviceFee = parseFloat(restOfData.serviceFee);
    if (restOfData.term) restOfData.term = parseInt(restOfData.term, 10);
    if (restOfData.interestOne) restOfData.interestOne = parseFloat(restOfData.interestOne);
    if (restOfData.interestTwo) restOfData.interestTwo = parseFloat(restOfData.interestTwo);
    if (restOfData.interestThree) restOfData.interestThree = parseFloat(restOfData.interestThree);
    if (restOfData.monthlyPaymentOne) restOfData.monthlyPaymentOne = parseFloat(restOfData.monthlyPaymentOne);
    if (restOfData.monthlyPaymentTwo) restOfData.monthlyPaymentTwo = parseFloat(restOfData.monthlyPaymentTwo);
    if (restOfData.monthlyPaymentThree) restOfData.monthlyPaymentThree = parseFloat(restOfData.monthlyPaymentThree);
    if (restOfData.downPaymentOne) restOfData.downPaymentOne = parseFloat(restOfData.downPaymentOne);
    if (restOfData.downPaymentTwo) restOfData.downPaymentTwo = parseFloat(restOfData.downPaymentTwo);
    if (restOfData.downPaymentThree) restOfData.downPaymentThree = parseFloat(restOfData.downPaymentThree);
    if (restOfData.loanAmountOne) restOfData.loanAmountOne = parseFloat(restOfData.loanAmountOne);
    if (restOfData.loanAmountTwo) restOfData.loanAmountTwo = parseFloat(restOfData.loanAmountTwo);
    if (restOfData.loanAmountThree) restOfData.loanAmountThree = parseFloat(restOfData.loanAmountThree);
    if (restOfData.purchasePrice) restOfData.purchasePrice = parseFloat(restOfData.purchasePrice);
    if (restOfData.financedPrice) restOfData.financedPrice = parseFloat(restOfData.financedPrice);


    // Process the "imageUrls" field (expected as JSON-stringified array)
    let finalExistingImages = [];
    if (imageUrls) {
      try {
        finalExistingImages = JSON.parse(imageUrls);
        if (!Array.isArray(finalExistingImages)) {
          finalExistingImages = [];
        }
      } catch (error) {
        finalExistingImages = [];
      }
    }

    // Process newly uploaded images (if any) from multer.
    let newImagePaths = [];
    if (req.files && req.files.length > 0) {
      // Use relative path: "uploads/" + file.filename
      newImagePaths = req.files.map((file) => "uploads/" + file.filename);
    }

    // Merge existing images with new image paths.
    const finalImageUrls = [...finalExistingImages, ...newImagePaths];

    // Prepare update data.
    let updateData = {
      ...restOfData,
      imageUrls: finalImageUrls, // Save as a JSON array in the DB.
    };

    if (userEmail) {
      updateData.owner = { connect: { email: userEmail } };
    }

    const updatedResidency = await prisma.residency.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json(updatedResidency);
  } catch (error) {
    console.error("Error updating residency:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        message: "Residency with this ID does not exist",
        error: error.message,
      });
    }
    if (error.code === "P2002") {
      return res.status(400).json({
        message: "Unique constraint violation—some field must be unique",
        error: error.message,
      });
    }
    if (error.code === "P2003") {
      return res.status(400).json({
        message: "Foreign key constraint failed—invalid relation",
        error: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to update property",
      error: error.message,
    });
  }
});


export const getResidencyImages = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const residency = await prisma.residency.findUnique({
    where: { id },
  });

  if (!residency || !residency.image) {
    return res.status(404).json({ message: "No images found for this residency" });
  }

  // Parse image array from JSON string
  const imagePaths = JSON.parse(residency.image);

  res.status(200).json({
    message: "Images retrieved successfully",
    images: imagePaths,
  });
});


export const createResidencyWithMultipleFiles = asyncHandler(async (req, res) => {
  console.log("This is creation request body: ", req.body);
  try {
    // Collect all uploaded file paths
    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map((file) => "uploads/" + file.filename);
    }

    // Process existing imageUrls from req.body (if any)
    let existingImages = [];
    if (req.body.imageUrls) {
      try {
        existingImages = JSON.parse(req.body.imageUrls);
        if (!Array.isArray(existingImages)) existingImages = [];
      } catch (err) {
        existingImages = [];
      }
    }
    // Merge existing images with the new image paths
    const allImageUrls = [...existingImages, ...imagePaths];

    // Destructure the fields from req.body
    const {
      //System Info

      ownerId,
      userEmail,
      area,
      status,
      featured,
      featuredWeight,

     // Listing Details

      title,
      description,
      notes,

    // Classification
      type,
      legalDescription,
      zoning,
      restrictions,
      mobileHomeFriendly,
      hoaPoa,
      hoaFee,
      hoaPaymentTerms,
      survey,

      // Location

      streetAddress,
      city,
      county,
      state,
      zip,
      latitude,
      longitude,
      apnOrPin,
      direction,
      landIdLink,
      landId,

    // Dimensions

      sqft,
      acre,

    // Pricing

    askingPrice,
    minPrice,
    disPrice,

    // Financing and Payment Calculation 
    financing,
    tax,
    hoaMonthly,
    serviceFee,
    term,
    interestOne,
    interestTwo,
    interestThree,
    monthlyPaymentOne,
    monthlyPaymentTwo,
    monthlyPaymentThree,
    downPaymentOne,
    downPaymentTwo,
    downPaymentThree,
    loanAmountOne,
    loanAmountTwo,
    loanAmountThree,
    purchasePrice,
    financedPrice,

    // Utilities
      water,
      sewer,
      electric,
      roadCondition,
      floodplain,


    //Media & Tags  
      ltag,
      rtag,


    } = req.body;

    const lowerCaseEmail = userEmail.toLowerCase();

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: lowerCaseEmail },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Create the residency with the array of image URLs stored in "imageUrls"
    const residency = await prisma.residency.create({
      data: {
        // System Info
        ownerId: parseInt(ownerId),
        area,
        status,
        featured: featured ?? "No",
        featuredWeight: featuredWeight ? parseInt(featuredWeight, 10) : null,
    
        // Listing Details
        title,
        description: description ?? null,
        notes: notes ?? null,
    
        // Classification
        type: type ?? null,
        legalDescription: legalDescription ?? null,
        zoning: zoning ?? null,
        restrictions: restrictions ?? null,
        mobileHomeFriendly: mobileHomeFriendly ?? null,
        hoaPoa: hoaPoa ?? null,
        hoaFee: hoaFee ? parseFloat(hoaFee) : null,
        hoaPaymentTerms: hoaPaymentTerms ?? null,
        survey: survey ?? null,
    
        // Location
        streetAddress,
        city,
        county,
        state,
        zip,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        apnOrPin,
        direction: direction ?? null,
        landIdLink: landIdLink ?? null,
        landId: landId ?? "Not-Available",
    
        // Dimensions
        sqft: parseInt(sqft),
        acre: acre ? parseFloat(acre) : null,
    
        // Pricing
        askingPrice: parseFloat(askingPrice),
        minPrice: parseFloat(minPrice),
        disPrice: disPrice ? parseFloat(disPrice) : null,
    
        // Financing and Payment Calculation 
        financing: financing ?? "Not-Available",
        tax: tax ? parseFloat(tax) : null,
        hoaMonthly: hoaMonthly ? parseFloat(hoaMonthly) : null,
        serviceFee: serviceFee ? parseFloat(serviceFee) : null,
        term: term ? parseInt(term, 10) : null,
        interestOne: interestOne ? parseFloat(interestOne) : null,
        interestTwo: interestTwo ? parseFloat(interestTwo) : null,
        interestThree: interestThree ? parseFloat(interestThree) : null,
        monthlyPaymentOne: monthlyPaymentOne ? parseFloat(monthlyPaymentOne) : null,
        monthlyPaymentTwo: monthlyPaymentTwo ? parseFloat(monthlyPaymentTwo) : null,
        monthlyPaymentThree: monthlyPaymentThree ? parseFloat(monthlyPaymentThree) : null,
        downPaymentOne: downPaymentOne ? parseFloat(downPaymentOne) : null,
        downPaymentTwo: downPaymentTwo ? parseFloat(downPaymentTwo) : null,
        downPaymentThree: downPaymentThree ? parseFloat(downPaymentThree) : null,
        loanAmountOne: loanAmountOne ? parseFloat(loanAmountOne) : null,
        loanAmountTwo: loanAmountTwo ? parseFloat(loanAmountTwo) : null,
        loanAmountThree: loanAmountThree ? parseFloat(loanAmountThree) : null,
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
        financedPrice: financedPrice ? parseFloat(financedPrice) : null,
    
        // Utilities
        water: water ?? null,
        sewer: sewer ?? null,
        electric: electric ?? null,
        roadCondition: roadCondition ?? null,
        floodplain: floodplain ?? null,
    
        // Media & Tags  
        ltag: ltag ?? null,
        rtag: rtag ?? null,
        imageUrls: allImageUrls.length > 0 ? allImageUrls : null,
    
        // Connect Owner
        owner: {
          connect: { email: lowerCaseEmail },
        },
      },
    });
    

    res.status(201).json({
      message: "Property added successfully",
      residency,
    });
  } catch (err) {
    console.error("Error creating residency:", err);
    res.status(500).json({
      message: `Failed to create property: ${err.message}`,
      error: err.message,
    });
  }

});




  
