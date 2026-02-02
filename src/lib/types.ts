export interface CatalogPage {
  id: string;
  display_order: number;
  title: string;
  images: CatalogImage[];
  specifications: Specification[];
  price?: Price;
  category?: string; // e.g. 'case', 'motherboard', 'keyboard'
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
}

export interface Price {
  id: string;
  page_id: string;
  amount: number;
  currency: string;
}
