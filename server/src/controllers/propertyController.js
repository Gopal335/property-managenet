import { Property } from "../models/Property.js";
import { PropertyInterest } from "../models/PropertyInterest.js";
import { fetchDriveFileStream, fetchDriveMedia } from "../services/driveService.js";
import { generatePropertyReadme } from "../services/readmeService.js";

export async function createProperty(req, res) {
  try {
    const { title, description, location, price, driveFolderUrl } = req.body;

    if (!title || !driveFolderUrl) {
      return res.status(400).json({ message: "title and driveFolderUrl are required." });
    }

    const property = await Property.create({
      owner: req.user.userId,
      title,
      description,
      location,
      price: Number(price ?? 0),
      driveFolderUrl,
      mediaFiles: [],
      generatedReadme: "",
    });

    return res.status(201).json(property);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function listProperties(req, res) {
  try {
    const properties = await Property.find({}).sort({ createdAt: -1 });
    return res.json(properties);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function importPropertyMedia(req, res) {
  try {
    const { id } = req.params;
    const property = await Property.findOne({ _id: id, owner: req.user.userId });
    if (!property) {
      return res.status(404).json({ message: "Property not found." });
    }

    const mediaFiles = await fetchDriveMedia(property.driveFolderUrl);
    property.mediaFiles = mediaFiles;
    property.importedAt = new Date();
    property.generatedReadme = generatePropertyReadme({
      ...property.toObject(),
      mediaFiles,
    });

    await property.save();
    return res.json(property);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getPropertyById(req, res) {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found." });
    }
    return res.json(property);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getPropertyReadme(req, res) {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found." });
    }

    if (!property.mediaFiles?.length) {
      return res.status(404).json({ message: "README has not been generated yet. Import Drive media first." });
    }

    // Always regenerate with the latest template so older records are upgraded.
    property.generatedReadme = generatePropertyReadme({
      ...property.toObject(),
      mediaFiles: property.mediaFiles,
    });
    await property.save();

    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    return res.send(property.generatedReadme);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function deleteProperty(req, res) {
  try {
    const property = await Property.findOneAndDelete({ _id: req.params.id, owner: req.user.userId });
    if (!property) {
      return res.status(404).json({ message: "Property not found." });
    }

    return res.json({ message: "Property deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function submitPropertyInterest(req, res) {
  try {
    const { id } = req.params;
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "name, email, and message are required." });
    }

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ message: "Property not found." });
    }

    await PropertyInterest.create({
      property: property._id,
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: String(phone ?? "").trim(),
      message: String(message).trim(),
    });

    return res.status(201).json({ message: "Your interest has been submitted." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function streamPropertyImage(req, res) {
  try {
    const { fileId } = req.params;
    const range = req.headers.range;
    const { mimeType, stream, headers, status } = await fetchDriveFileStream(fileId, range);

    res.status(status);
    
    const copyHeaders = ['content-range', 'accept-ranges', 'content-length', 'content-type'];
    for (const h of copyHeaders) {
      if (headers[h]) {
        res.setHeader(h, headers[h]);
      } else if (headers[h.toLowerCase()]) {
        res.setHeader(h, headers[h.toLowerCase()]);
      }
    }
    
    if (!res.getHeader('Content-Type')) {
      res.setHeader("Content-Type", mimeType);
    }
    res.setHeader("Cache-Control", "public, max-age=3600");
    
    stream.on("error", () => {
      if (!res.headersSent) {
        res.status(500).json({ message: "Media stream failed." });
      }
    });
    stream.pipe(res);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getInterests(req, res) {
  try {
    const interests = await PropertyInterest.find().populate("property", "title").sort({ createdAt: -1 });
    return res.json(interests);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
