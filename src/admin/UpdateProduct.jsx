import React, { useState, useEffect } from "react";
import "./css/updateP.css";
import { useUpdateBazsStationMutation } from "../context/productionApi";
import { FiX } from "react-icons/fi";

function UpdateProduct({ data, setCloseModal }) {
  const [updateProduct] = useUpdateBazsStationMutation();
  const [formData, setFormData] = useState({
    titleUz: "",
    titleRu: "",
    titleEn: "",

    applicationAreasUz: "",
    applicationAreasRu: "",
    applicationAreasEn: "",

    usageMethodUz: "",
    usageMethodRu: "",
    usageMethodEn: "",

    safetyRequirementsUz: "",
    safetyRequirementsRu: "",
    safetyRequirementsEn: "",

    storageAndTransportUz: "",
    storageAndTransportRu: "",
    storageAndTransportEn: "",

    manufacturerWarrantyUz: "",
    manufacturerWarrantyRu: "",
    manufacturerWarrantyEn: "",

    price: "",
  });

  useEffect(() => {
    if (data) {
      setFormData({
        titleUz: data.title?.uz || "",
        titleRu: data.title?.ru || "",
        titleEn: data.title?.en || "",

        applicationAreasUz: data.applicationAreas?.uz || "",
        applicationAreasRu: data.applicationAreas?.ru || "",
        applicationAreasEn: data.applicationAreas?.en || "",

        usageMethodUz: data.usageMethod?.uz || "",
        usageMethodRu: data.usageMethod?.ru || "",
        usageMethodEn: data.usageMethod?.en || "",

        safetyRequirementsUz: data.safetyRequirements?.uz || "",
        safetyRequirementsRu: data.safetyRequirements?.ru || "",
        safetyRequirementsEn: data.safetyRequirements?.en || "",

        storageAndTransportUz: data.storageAndTransport?.uz || "",
        storageAndTransportRu: data.storageAndTransport?.ru || "",
        storageAndTransportEn: data.storageAndTransport?.en || "",

        manufacturerWarrantyUz: data.manufacturerWarranty?.uz || "",
        manufacturerWarrantyRu: data.manufacturerWarranty?.ru || "",
        manufacturerWarrantyEn: data.manufacturerWarranty?.en || "",

        price: data.price || "",
      });
    }
  }, [data]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const updatedProduct = {
        ...data,
        title: {
          uz: formData.titleUz,
          ru: formData.titleRu,
          en: formData.titleEn,
        },
        applicationAreas: {
          uz: formData.applicationAreasUz,
          ru: formData.applicationAreasRu,
          en: formData.applicationAreasEn,
        },
        usageMethod: {
          uz: formData.usageMethodUz,
          ru: formData.usageMethodRu,
          en: formData.usageMethodEn,
        },
        safetyRequirements: {
          uz: formData.safetyRequirementsUz,
          ru: formData.safetyRequirementsRu,
          en: formData.safetyRequirementsEn,
        },
        storageAndTransport: {
          uz: formData.storageAndTransportUz,
          ru: formData.storageAndTransportRu,
          en: formData.storageAndTransportEn,
        },
        manufacturerWarranty: {
          uz: formData.manufacturerWarrantyUz,
          ru: formData.manufacturerWarrantyRu,
          en: formData.manufacturerWarrantyEn,
        },
        price: formData.price,
      };
      await updateProduct({ id: data._id, body: updatedProduct }).unwrap();
      alert("Mahsulot muvaffaqiyatli yangilandi");
      setCloseModal(false);
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  if (!data) return <div>Mahsulot tanlanmagan</div>;

  return (
    <div className="update-product-container">
      <FiX
        className="close-icon"
        onClick={() => setCloseModal(false)}
        aria-hidden="true"
      />
      <h1>Yangilash</h1>

      {/* Title */}
      <h3>Nomi</h3>
      <label>
        Uz:{" "}
        <input
          type="text"
          value={formData.titleUz}
          onChange={(e) => handleChange("titleUz", e.target.value)}
        />
      </label>
      <br />
      <label>
        Ru:{" "}
        <input
          type="text"
          value={formData.titleRu}
          onChange={(e) => handleChange("titleRu", e.target.value)}
        />
      </label>
      <br />
      <label>
        En:{" "}
        <input
          type="text"
          value={formData.titleEn}
          onChange={(e) => handleChange("titleEn", e.target.value)}
        />
      </label>

      {/* Application Areas */}
      <h3>Qo'llash sohalari</h3>
      <label>
        Uz:{" "}
        <textarea
          rows={4}
          value={formData.applicationAreasUz}
          onChange={(e) => handleChange("applicationAreasUz", e.target.value)}
        />
      </label>
      <br />
      <label>
        Ru:{" "}
        <textarea
          rows={4}
          value={formData.applicationAreasRu}
          onChange={(e) => handleChange("applicationAreasRu", e.target.value)}
        />
      </label>
      <br />
      <label>
        En:{" "}
        <textarea
          rows={4}
          value={formData.applicationAreasEn}
          onChange={(e) => handleChange("applicationAreasEn", e.target.value)}
        />
      </label>

      {/* Usage Method */}
      <h3>Foydalanish usuli</h3>
      <label>
        Uz:{" "}
        <textarea
          rows={3}
          value={formData.usageMethodUz}
          onChange={(e) => handleChange("usageMethodUz", e.target.value)}
        />
      </label>
      <br />
      <label>
        Ru:{" "}
        <textarea
          rows={3}
          value={formData.usageMethodRu}
          onChange={(e) => handleChange("usageMethodRu", e.target.value)}
        />
      </label>
      <br />
      <label>
        En:{" "}
        <textarea
          rows={3}
          value={formData.usageMethodEn}
          onChange={(e) => handleChange("usageMethodEn", e.target.value)}
        />
      </label>

      {/* Safety Requirements */}
      <h3>Xavfsizlik talablari</h3>
      <label>
        Uz:{" "}
        <textarea
          rows={3}
          value={formData.safetyRequirementsUz}
          onChange={(e) => handleChange("safetyRequirementsUz", e.target.value)}
        />
      </label>
      <br />
      <label>
        Ru:{" "}
        <textarea
          rows={3}
          value={formData.safetyRequirementsRu}
          onChange={(e) => handleChange("safetyRequirementsRu", e.target.value)}
        />
      </label>
      <br />
      <label>
        En:{" "}
        <textarea
          rows={3}
          value={formData.safetyRequirementsEn}
          onChange={(e) => handleChange("safetyRequirementsEn", e.target.value)}
        />
      </label>

      {/* Storage And Transport */}
      <h3>Saqlash va tashish</h3>
      <label>
        Uz:{" "}
        <textarea
          rows={3}
          value={formData.storageAndTransportUz}
          onChange={(e) =>
            handleChange("storageAndTransportUz", e.target.value)
          }
        />
      </label>
      <br />
      <label>
        Ru:{" "}
        <textarea
          rows={3}
          value={formData.storageAndTransportRu}
          onChange={(e) =>
            handleChange("storageAndTransportRu", e.target.value)
          }
        />
      </label>
      <br />
      <label>
        En:{" "}
        <textarea
          rows={3}
          value={formData.storageAndTransportEn}
          onChange={(e) =>
            handleChange("storageAndTransportEn", e.target.value)
          }
        />
      </label>

      {/* Manufacturer Warranty */}
      <h3>Ishlab chiqaruvchi kafolati</h3>
      <label>
        Uz:{" "}
        <textarea
          rows={3}
          value={formData.manufacturerWarrantyUz}
          onChange={(e) =>
            handleChange("manufacturerWarrantyUz", e.target.value)
          }
        />
      </label>
      <br />
      <label>
        Ru:{" "}
        <textarea
          rows={3}
          value={formData.manufacturerWarrantyRu}
          onChange={(e) =>
            handleChange("manufacturerWarrantyRu", e.target.value)
          }
        />
      </label>
      <br />
      <label>
        En:{" "}
        <textarea
          rows={3}
          value={formData.manufacturerWarrantyEn}
          onChange={(e) =>
            handleChange("manufacturerWarrantyEn", e.target.value)
          }
        />
      </label>

      {/* Price */}
      <h3>Narxi</h3>
      <label>
        <input
          type="string"
          value={formData.price}
          onChange={(e) => handleChange("price", e.target.value)}
        />
      </label>

      <br />
      <button onClick={handleSave} style={{ marginTop: "15px" }}>
        Save
      </button>
    </div>
  );
}

export default UpdateProduct;
