import React from "react";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RealEstateAgent({ surveyData, updateSurveyData, onNext, onBack }) {
  // Handle selection
  const handleSelection = (hasAgent) => {
    updateSurveyData("real_estate_agent", hasAgent);
    onNext();
  };

  // Translation object based on selected language
  const translations = {
    en: {
      title: "Do you have a real estate agent?",
      yes: "Yes",
      no: "No",
      back: "Back"
    },
    es: {
      title: "¿Tiene un agente inmobiliario?",
      yes: "Sí",
      no: "No",
      back: "Atrás"
    }
  };

  // Get translations based on selected language
  const t = translations[surveyData.language || "en"];

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardContent className="p-0">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-[#324c48] mb-8">
            {t.title}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 max-w-md mx-auto">
            <Button
              className="py-6 px-4 bg-white hover:bg-[#f4f7ee] text-[#3f4f24] text-lg rounded-lg border border-[#3f4f24] transition-all duration-200 hover:shadow-md"
              onClick={() => handleSelection("Yes")}
            >
              {t.yes}
            </Button>
            
            <Button
              className="py-6 px-4 bg-white hover:bg-[#f4f7ee] text-[#3f4f24] text-lg rounded-lg border border-[#3f4f24] transition-all duration-200 hover:shadow-md"
              onClick={() => handleSelection("No")}
            >
              {t.no}
            </Button>
          </div>
          
          <div className="mt-8 flex justify-center">
            <Button
              variant="outline"
              className="text-[#324c48] border-[#324c48] hover:bg-[#f0f5f4]"
              onClick={onBack}
            >
              {t.back}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}