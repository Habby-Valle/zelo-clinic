export interface Address {
  zip_code: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
}

export interface Clinic {
  id: number;
  name: string;
  document: string;
  phone: string;
  address: Address | null;
  media_id: number | null;
  media_url: string | null;
  theme_color: string | null;
}
