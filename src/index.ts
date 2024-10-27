import prices from './prices.json';
export type ServiceYear = 2020 | 2021 | 2022;
export type ServiceType = "Photography" | "VideoRecording" | "BlurayPackage" | "TwoDayEvent" | "WeddingSession";

export const updateSelectedServices = (
    previouslySelectedServices: ServiceType[],
    action: { type: "Select" | "Deselect"; service: ServiceType }
): ServiceType[] => {
    const isServiceSelected = (service: ServiceType) =>
        previouslySelectedServices.includes(service);

    const shouldSelect = (service: ServiceType): boolean => {
        if (service === "BlurayPackage" && !isServiceSelected("VideoRecording")) return false;
        if (
            service === "TwoDayEvent" &&
            !isServiceSelected("VideoRecording") &&
            !isServiceSelected("Photography")
        )
            return false;
        return !isServiceSelected(service);
    };

    const shouldDeselectRelated = (service: ServiceType, deselected: ServiceType[]) => {
        if (service === "VideoRecording") {
            deselected = deselected.filter((s) => s !== "BlurayPackage");
        }
        if (service === "VideoRecording" && isServiceSelected("TwoDayEvent") && !isServiceSelected("Photography")) {
            deselected = deselected.filter((s) => s !== "TwoDayEvent");
        }
        if (service === "Photography" && isServiceSelected("TwoDayEvent") && !isServiceSelected("VideoRecording")) {
            deselected =  deselected.filter((s) => s !== "TwoDayEvent");
        }
        return deselected;
    };

    switch (action.type) {
        case "Select":
            return shouldSelect(action.service)
                ? [...previouslySelectedServices, action.service]
                : previouslySelectedServices;

        case "Deselect":
            let deselectedServices = previouslySelectedServices.filter(
                (service) => service !== action.service
            );
            return shouldDeselectRelated(action.service, deselectedServices);

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