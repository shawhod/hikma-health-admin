export type Patient = {
  id: string;
  givenName: string;
  surname: string;
  dateOfBirth: string;
  country: string;
  hometown: string;
  sex: string;
  phone: string;
  camp: string;
  createdAt: Date;
  updatedAt: Date;

  // convenience fields for the data from directly from the server
  given_name: string;
  date_of_birth: string;
  created_at: string;
  updated_at: string;
};
