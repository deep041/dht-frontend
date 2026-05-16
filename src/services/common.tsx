import API from "./api";

export default class CommonService {
    static getStates = async (countryCode: any) => {
        try {
            const response = await API.get("/common/states?country_id=" + countryCode);
            return response.data;
        } catch (error) {
            console.error("Error fetching states:", error);
            throw error;
        }
    }

    static getCountries = async () => {
        try {
            const response = await API.get("/common/country");
            return response.data;
        } catch (error) {
            console.error("Error fetching country:", error);
            throw error;
        }
    }

    static getDepartments = async () => {
        try {
            const response = await API.get("/department");
            return response.data;
        } catch (error) {
            console.error("Error fetching departments:", error);
            throw error;
        }
    }

    static getRoles = async () => {
        try {
            const response = await API.get("/roles");
            return response.data;
        } catch (error) {
            console.error("Error fetching roles:", error);
            throw error;
        }
    }

    static getRegions = async () => {
        try {
            const response = await API.get("/region");
            return response.data;
        } catch (error) {
            console.error("Error fetching regions:", error);
            throw error;
        }
    }

    static getZones = async (regionID: any) => {
        try {
            const response = await API.get("/zone/region/" + regionID);
            return response.data;
        } catch (error) {
            console.error("Error fetching zones:", error);
            throw error;
        }
    }

    static getSubZones = async (zoneID: any) => {
        try {
            const response = await API.get("/sub-zone/zone/" + zoneID);
            return response.data;
        } catch (error) {
            console.error("Error fetching sub-zones:", error);
            throw error;
        }
    }

    static getClassifications = async () => {
        try {
            const response = await API.get("/classification");
            return response.data;
        } catch (error) {
            console.error("Error fetching classifications:", error);
            throw error;
        }
    }

    static getCategories = async () => {
        try {
            const response = await API.get("/category");
            return response.data;
        } catch (error) {
            console.error("Error fetching categories:", error);
            throw error;
        }
    }

    static getGroups = async () => {
        try {
            const response = await API.get("/group");
            return response.data;
        } catch (error) {
            console.error("Error fetching groups:", error);
            throw error;
        }
    }

    static getSubGroups = async (groupID: any) => {
        try {
            const response = await API.get("/sub-group/" + groupID);
            return response.data;
        } catch (error) {
            console.error("Error fetching sub-groups:", error);
            throw error;
        }
    }

    static getUnits = async () => {
        try {
            const response = await API.get("/unit");
            return response.data;
        } catch (error) {
            console.error("Error fetching units:", error);
            throw error;
        }
    }

    static getHsnList = async () => {
        try {
            const response = await API.get("/hsn");
            return response.data;
        } catch (error) {
            console.error("Error fetching HSN list:", error);
            throw error;
        }
    }
}

export const getStates = CommonService.getStates;
export const getCountries = CommonService.getCountries;
export const getDepartments = CommonService.getDepartments;
export const getRoles = CommonService.getRoles;
export const getRegions = CommonService.getRegions;
export const getZones = CommonService.getZones;
export const getSubZones = CommonService.getSubZones;
export const getClassifications = CommonService.getClassifications;
export const getCategories = CommonService.getCategories;
export const getGroups = CommonService.getGroups;
export const getSubGroups = CommonService.getSubGroups;
export const getUnits = CommonService.getUnits;
export const getHsnList = CommonService.getHsnList;