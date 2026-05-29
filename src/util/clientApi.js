import { emptyDocumentsPayload } from "@/constants/clientDocuments";

export function normalizeClientFromApi(client) {
  if (!client) {
    return null;
  }
  const documents = client.documents || emptyDocumentsPayload();

  return {
    id: client.id,
    code: client.code || "",
    full_name: client.full_name || "",
    identification_card: client.identification_card || "",
    rfc: client.rfc || "",
    address: client.address || "",
    colony: client.colony || "",
    zip_code: client.zip_code || "",
    phone_number: client.phone_number || "",
    city: client.city || "",
    state: client.state || "",
    country: client.country || "",
    assignee: client.assignee || "",
    email: client.email || "",
    birthday: client.birthday || "",
    nationality: client.nationality || "",
    civil_status: client.civil_status || "",
    spouse: client.spouse || "",
    economic_dependants: client.economic_dependants ?? false,
    home_owner: client.home_owner ?? false,
    occupation: client.occupation || "",
    company: client.company || "",
    company_address: client.company_address || "",
    company_phone: client.company_phone || "",
    monthly_income: client.monthly_income ?? 0,
    monthly_expenses: client.monthly_expenses ?? 0,
    comments: client.comments || "",
    image: client.image || "",
    documents,
    ine_verification_status:
      client.ine_verification_status ||
      documents.ine?.verification_status ||
      "pending",
    tax_document_verification_status:
      client.tax_document_verification_status ||
      documents.tax_document?.verification_status ||
      "pending",
    proof_of_address_verification_status:
      client.proof_of_address_verification_status ||
      documents.proof_of_address?.verification_status ||
      "pending",
  };
}
