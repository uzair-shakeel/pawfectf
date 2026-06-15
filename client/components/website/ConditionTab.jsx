import React from "react";

const ConditionTab = ({ carCondition }) => {
  const translateCondition = (value) => {
    if (!value || typeof value !== "string") return value || "-";
    const key = value.trim().toLowerCase();
    const map = {
      "very good": "Bardzo Dobry",
      good: "Dobry",
      normal: "Normalny",
      excellent: "Doskonały",
      fair: "Umiarkowany",
      "like new": "Jak nowy",
      new: "Nowy",
    };
    return map[key] || value;
  };

  return (
    <div className="w-full">
      <p className="text-[15px] sm:text-[16px] text-gray-700 dark:text-gray-300 leading-relaxed">
        Stan lakieru i karoserii oceniono jako {translateCondition(carCondition?.paintandBody)},
        a podwozia i ramy jako {translateCondition(carCondition?.frameandUnderbody)}.
        Wnętrze zachowane jest w stanie {translateCondition(carCondition?.interior)},
        natomiast stan mechaniczny to {translateCondition(carCondition?.mechanical)}.
        Ogólna kondycja pojazdu: {translateCondition(carCondition?.overall)}.
      </p>
    </div>
  );
};

export default ConditionTab;
