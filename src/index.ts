import prices from './prices.json';
export type ServiceYear = 2020 | 2021 | 2022;
export type ServiceType = "Photography" | "VideoRecording" | "BlurayPackage" | "TwoDayEvent" | "WeddingSession";

export const updateSelectedServices = (
    previouslySelectedServices: ServiceType[],
    action: { type: "Select" | "Deselect"; service: ServiceType }
): ServiceType[] => {
    switch (action.type) {
        case "Select":

            if(action.service === "BlurayPackage" && !previouslySelectedServices.includes("VideoRecording"))
                return previouslySelectedServices;

            if(action.service === "TwoDayEvent" && (!previouslySelectedServices.includes("VideoRecording") && !previouslySelectedServices.includes("Photography") ))
                return previouslySelectedServices;

            // Add the service if it is not already included
            if (!previouslySelectedServices.includes(action.service)) {
                return [...previouslySelectedServices, action.service];
            }
            return previouslySelectedServices;

        case "Deselect":
            // Remove the service if it is currently included
            let deselectedServices = previouslySelectedServices.filter(
                (service) => service !== action.service
            );

            if(action.service == "VideoRecording"){
                if(deselectedServices.includes("BlurayPackage")){
                    deselectedServices = deselectedServices.filter(
                        (service) => service !== "BlurayPackage"
                    );
                }
            }

            if(action.service == "VideoRecording" && deselectedServices.includes("TwoDayEvent") && !deselectedServices.includes("Photography"))
                {
                    deselectedServices = deselectedServices.filter(
                        (service) => service !== "TwoDayEvent"
                    );
                }

            if(action.service == "Photography" && deselectedServices.includes("TwoDayEvent") && !deselectedServices.includes("VideoRecording"))
                {
                    deselectedServices = deselectedServices.filter(
                        (service) => service !== "TwoDayEvent"
                    );
                }

            return deselectedServices;

        default:
            return previouslySelectedServices;
    }
};

export const calculatePrice = (selectedServices: ServiceType[], selectedYear: ServiceYear): { basePrice: number, finalPrice: number } => {
    let basePrice = 0;
    let discounts: number[] = [];

    const isPhotographySelected = selectedServices.includes("Photography");
    const isVideoSelected = selectedServices.includes('VideoRecording');
    const isWeddingSessionSelected = selectedServices.includes('WeddingSession');
    const isBluRaySelected = selectedServices.includes('BlurayPackage');
    const isTwoDayEventSelected = selectedServices.includes('TwoDayEvent');

    const yearPrices = prices[selectedYear];

    if (isPhotographySelected) {
        basePrice += yearPrices.photography;
    }

    if (isVideoSelected) {
        basePrice += yearPrices.video;
    }

    if (isPhotographySelected && isVideoSelected) {
        discounts.push(yearPrices.photography + yearPrices.video - yearPrices.photoVideoPackage)
    }

    if (isWeddingSessionSelected) {

        let weddingPrice = yearPrices.weddingSession;

        if (isPhotographySelected || isVideoSelected){
            if(selectedYear === 2022 && isPhotographySelected){
                weddingPrice = 0;
            }else{
                weddingPrice = yearPrices.weddingSessionWithPackage;
            }
        }

        basePrice += weddingPrice;

    }

    if (isBluRaySelected && isVideoSelected) {
        basePrice += yearPrices.bluRayPackage;
    }

    if (isTwoDayEventSelected && (isPhotographySelected || isVideoSelected)) {
        basePrice += yearPrices.twoDayEvent;
    }


    const maxDiscount = discounts.length > 0 ? Math.max(...discounts) : 0;

    const finalPrice = basePrice - maxDiscount;


    return { basePrice, finalPrice };
}