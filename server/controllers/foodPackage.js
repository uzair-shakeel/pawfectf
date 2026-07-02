const FoodPackage = require('../models/FoodPackage');

// Get all food packages
exports.getAllPackages = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      suitableFor,
      animalSize,
      activeOnly = 'true'
    } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (suitableFor) filter.suitableFor = { $in: [suitableFor] };
    if (animalSize) filter.animalSizes = { $in: [animalSize] };
    if (activeOnly === 'true') filter.isActive = true;

    const packages = await FoodPackage.find(filter)
      .populate('createdBy', 'firstName lastName')
      .sort({ popularityScore: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await FoodPackage.countDocuments(filter);

    res.json({
      packages,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single package
exports.getPackage = async (req, res) => {
  try {
    const package = await FoodPackage.findById(req.params.id)
      .populate('createdBy', 'firstName lastName profilePicture');

    if (!package) {
      return res.status(404).json({ message: 'Package not found' });
    }

    res.json(package);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new package (admin only)
exports.createPackage = async (req, res) => {
  try {
    const {
      name,
      type,
      description,
      pricing,
      contents,
      suitableFor,
      animalSizes,
      features,
      images,
      stock
    } = req.body;

    const package = new FoodPackage({
      name,
      type,
      description,
      pricing,
      contents,
      suitableFor,
      animalSizes,
      features,
      images,
      stock,
      createdBy: req.user.id
    });

    await package.save();
    
    res.status(201).json(package);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update package (admin only)
exports.updatePackage = async (req, res) => {
  try {
    const package = await FoodPackage.findById(req.params.id);
    
    if (!package) {
      return res.status(404).json({ message: 'Package not found' });
    }

    // Check if user is admin or created the package
    if (req.user.role !== 'admin' && package.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(package, req.body);
    await package.save();

    res.json(package);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete package (admin only)
exports.deletePackage = async (req, res) => {
  try {
    const package = await FoodPackage.findById(req.params.id);
    
    if (!package) {
      return res.status(404).json({ message: 'Package not found' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await FoodPackage.findByIdAndDelete(req.params.id);
    res.json({ message: 'Package deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get packages suitable for specific pet
exports.getPackagesForPet = async (req, res) => {
  try {
    const { petType, petSize } = req.query;
    
    if (!petType) {
      return res.status(400).json({ message: 'Pet type is required' });
    }

    const filter = {
      isActive: true,
      suitableFor: { $in: [petType.toLowerCase()] }
    };

    if (petSize) {
      filter.animalSizes = { $in: [petSize.toLowerCase()] };
    }

    const packages = await FoodPackage.find(filter)
      .sort({ popularityScore: -1 });

    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Increment package donation counter
exports.incrementDonations = async (req, res) => {
  try {
    const package = await FoodPackage.findById(req.params.id);
    
    if (!package) {
      return res.status(404).json({ message: 'Package not found' });
    }

    package.totalDonations += 1;
    package.popularityScore += 1;
    
    if (package.stock > 0) {
      package.stock -= 1;
    }

    await package.save();
    res.json({ message: 'Package updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};