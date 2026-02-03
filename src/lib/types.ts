export interface CatalogPage {
  id: string;
  display_order: number;
  title: string;
  images: CatalogImage[];
  specifications: Specification[];
  price?: Price;
  category?: string; // e.g. 'case', 'motherboard', 'keyboard'
  prices?: { amount: number }[];
  max_gpu_length?: string;
  max_cpu_cooler_height?: string;
  motherboard_form_factor?: string;
  cooling_airflow?: string;
  fan_count?: string;
}

export interface CatalogImage {
  id: string;
  page_id: string;
  url: string;
  display_order: number;
}

export interface Specification {
  id: string;
  page_id: string;
  label: string;
  value: string;
  display_order: number;
  spec_group?: 'MAIN' | 'STRUCTURE' | 'COOLING' | 'INPUT_OUTPUT' | 'STORAGE' | 'ADDITIONAL';
}

export interface Price {
  id: string;
  page_id: string;
  amount: number;
  currency: string;
}
