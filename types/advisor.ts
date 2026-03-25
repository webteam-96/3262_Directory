export interface Advisor {
  id: string;
  name: string;
  dob: string;
  dow: string;
  classification: string;
  mobile: string;
  email: string;
  address: string;
  hclub: string;
  spouse: string;
  photo1Url: string;
  photo2Url: string;
}

export interface AdvisorsResponse {
  data: Advisor[];
  total: number;
  page: number;
  pageSize: number;
}
