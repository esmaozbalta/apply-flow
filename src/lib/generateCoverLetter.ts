import type { PersonalInfo, ExperienceItem } from "@/types";

export type CoverLetterLanguage = "en" | "tr";

/**
 * Extracts meaningful keywords/phrases from the professional summary
 * to incorporate into the cover letter body.
 */
function extractSummaryKeywords(
  summary: string,
  language: CoverLetterLanguage
): string {
  const trimmed = summary.trim();
  if (!trimmed) {
    return language === "tr"
      ? "çeşitli profesyonel deneyim"
      : "diverse professional experience";
  }

  const sentences = trimmed.split(/[.!?]+/).filter(Boolean);
  const firstSentence = sentences[0]?.trim() || trimmed;
  if (firstSentence.length < 150) {
    return firstSentence;
  }
  const truncated = firstSentence.slice(0, 120).trim();
  const lastSpace = truncated.lastIndexOf(" ");
  return lastSpace > 60 ? truncated.slice(0, lastSpace) + "..." : truncated + "...";
}

/**
 * Generates a professional cover letter using a modern template
 * with dynamic placeholders from user inputs.
 */
export function generateCoverLetter(
  personalInfo: PersonalInfo,
  experience: ExperienceItem[],
  companyName: string,
  hiringManagerName: string,
  role: string,
  language: CoverLetterLanguage = "en"
): string {
  const applicantName = personalInfo.name.trim() || (language === "tr" ? "Başvuru Sahibi" : "Applicant");
  const roleText = role.trim() || (language === "tr" ? "bu pozisyon" : "this position");
  const companyText = companyName.trim() || (language === "tr" ? "şirketiniz" : "your company");
  const summaryKeywords = extractSummaryKeywords(personalInfo.summary, language);

  if (language === "tr") {
    const greeting = hiringManagerName.trim()
      ? `Sayın ${hiringManagerName},`
      : companyText
        ? `Sayın ${companyText} Ekibi,`
        : "Sayın İlgili,";

    const experienceHighlights =
      experience.length > 0
        ? experience
            .slice(0, 3)
            .map(
              (exp) =>
                `${exp.company}'de ${exp.title}${exp.location ? ` (${exp.location})` : ""}`
            )
            .join("; ")
        : "profesyonel geçmişim";

    const template = [
      greeting,
      "",
      `${companyText} bünyesindeki ${roleText} ilanıyla ilgileniyorum. ${summaryKeywords} konusunda deneyime sahip bir profesyonel olarak, geçmişimin gereksinimlerinizle uyumlu olduğuna inanıyorum.`,
      "",
      experience.length > 0
        ? `Deneyimlerim arasında ${experienceHighlights} bulunmaktadır. Bu görevlerde sürekli olarak sonuç odaklı çalıştım, disiplinler arası ekiplerle etkin iş birliği yaptım ve mükemmelliğe bağlılığımı gösterdim. Bu deneyimi ${companyText} ekibine taşıma ve başarınıza katkıda bulunma fırsatı beni heyecanlandırıyor.`
        : `Becerilerimi ve özverimi ${companyText} ekibine taşımak ve nasıl katkıda bulunabileceğimi görüşmek isterim.`,
      "",
      `Başvurumu değerlendirdiğiniz için teşekkür ederim. Bu fırsatı görüşme imkânı sunmanızı dört gözle bekliyorum.`,
      "",
      "Saygılarımla,",
      applicantName,
    ];

    return template.join("\n");
  }

  // English
  const greeting = hiringManagerName.trim()
    ? `Dear ${hiringManagerName},`
    : companyText
      ? `Dear ${companyText} Team,`
      : "Dear Hiring Manager,";

  const experienceHighlights =
    experience.length > 0
      ? experience
          .slice(0, 3)
          .map(
            (exp) =>
              `${exp.title} at ${exp.company}${exp.location ? ` (${exp.location})` : ""}`
          )
          .join("; ")
      : "my professional background";

  const template = [
    greeting,
    "",
    `I am writing to express my strong interest in the ${roleText} position at ${companyText}. As a professional with experience in ${summaryKeywords}, I believe my background aligns perfectly with your requirements.`,
    "",
    experience.length > 0
      ? `My experience includes ${experienceHighlights}. Throughout these roles, I have consistently delivered results, collaborated effectively with cross-functional teams, and demonstrated a commitment to excellence. I am excited about the opportunity to bring this experience to ${companyText} and contribute to your team's success.`
      : `I am eager to bring my skills and dedication to ${companyText} and would welcome the opportunity to discuss how I can contribute to your team.`,
    "",
    `Thank you for considering my application. I look forward to the possibility of discussing this opportunity further.`,
    "",
    "Best regards,",
    applicantName,
  ];

  return template.join("\n");
}

export function generateEmailBody(
  coverLetter: string,
  personalInfo: PersonalInfo,
  role?: string,
  language: CoverLetterLanguage = "en"
): string {
  const position = role?.trim() || (language === "tr" ? "[Pozisyon]" : "[Position]");
  const name = personalInfo.name.trim() || (language === "tr" ? "Başvuru Sahibi" : "Applicant");
  const subject =
    language === "tr"
      ? `Konu: ${position} Başvurusu - ${name}`
      : `Subject: Application for ${position} - ${name}`;
  const lines = [subject, "", "---", "", coverLetter];
  return lines.join("\n");
}
