import React, { createContext, useContext, useState } from "react";

type ShopContextValue = {
	isShopOpen: boolean;
	openShop: () => void;
	closeShop: () => void;
	addConfigToRun: (configId: string) => void;
	removeConfigFromRun: (configId: string) => void;
};

const ShopContext = createContext<ShopContextValue | null>(null);

type ShopProviderProps = {
	children: React.ReactNode;
	onAddConfig: (configId: string) => void;
	onRemoveConfig: (configId: string) => void;
	initialShopOpen?: boolean;
	onShopOpenChange?: (isOpen: boolean) => void;
};

export const ShopProvider = ({
	children,
	onAddConfig,
	onRemoveConfig,
	initialShopOpen = false,
	onShopOpenChange,
}: ShopProviderProps) => {
	const [isShopOpen, setIsShopOpen] = useState(initialShopOpen);

	const openShop = () => {
		setIsShopOpen(true);
		onShopOpenChange?.(true);
	};

	const closeShop = () => {
		setIsShopOpen(false);
		onShopOpenChange?.(false);
	};

	const addConfigToRun = (configId: string) => {
		onAddConfig(configId);
	};

	const removeConfigFromRun = (configId: string) => {
		onRemoveConfig(configId);
	};

	const value: ShopContextValue = {
		isShopOpen,
		openShop,
		closeShop,
		addConfigToRun,
		removeConfigFromRun,
	};

	return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export const useShopContext = () => {
	const context = useContext(ShopContext);
	if (!context) {
		throw new Error("useShopContext must be used within a ShopProvider");
	}
	return context;
};
