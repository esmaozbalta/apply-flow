import type { PersonalInfo, ExperienceItem } from "@/types";

export type CoverLetterLanguage = "en" | "tr";



/**
 * Turkish vowel harmony: returns the correct locative suffix (-de/-da/-te/-ta)
 * appended to a proper noun with an apostrophe.
 *
 * Examples:
 *   addLocative("Digitürk")  → "Digitürk'te"
 *   addLocative("Google")    → "Google'da"
 *   addLocative("Ankara")    → "Ankara'da"
 */
function addLocative(word: string): string {
  const lower = word.toLowerCase();
  const backVowels = ["a", "ı", "o", "u"];
  const frontVowels = ["e", "i", "ö", "ü"];
  const hardConsonants = ["ç", "f", "h", "k", "p", "s", "ş", "t"];

  let lastVowel = "";
  for (let i = lower.length - 1; i >= 0; i--) {
    if ([...backVowels, ...frontVowels].includes(lower[i])) {
      lastVowel = lower[i];
      break;
    }
  }

  const lastChar = lower[lower.length - 1];
  const isHard = hardConsonants.includes(lastChar);
  const consonantPrefix = isHard ? "t" : "d";
  const vowelSuffix = backVowels.includes(lastVowel) ? "a" : "e";

  return `${word}'${consonantPrefix}${vowelSuffix}`;
}

function extractSummarySnippet(
  summary: string,
  language: CoverLetterLanguage
): string {
  const trimmed = summary.trim();
  if (!trimmed) return "";

  const sentences = trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const first = sentences[0]?.trim() || trimmed;

  if (first.length <= 160) return first;

  const cut = first.slice(0, 140).trim();
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 80 ? cut.slice(0, lastSpace) : cut) + "...";
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
  const applicantName =
    personalInfo.name.trim() ||
    (language === "tr" ? "Başvuru Sahibi" : "Applicant");
  const roleText =
    role.trim() || (language === "tr" ? "ilgili pozisyon" : "this position");
  const companyText =
    companyName.trim() || (language === "tr" ? "şirketiniz" : "your company");
  const summarySnippet = extractSummarySnippet(personalInfo.summary, language);

  if (language === "tr") {
    const greeting = hiringManagerName.trim()
      ? `Sayın ${hiringManagerName},`
      : companyText !== "şirketiniz"
        ? `Sayın ${companyText} Ekibi,`
        : "Sayın İlgili Kişi,";

    // Opening paragraph — uses summary naturally if available
    const opening = summarySnippet
      ? `${companyText !== "şirketiniz" ? addLocative(companyText) : companyText + " bünyesinde"} açık olan ${roleText} pozisyonuna başvurmaktan memnuniyet duyuyorum. ${summarySnippet}. Bu birikimimin söz konusu pozisyonun gereksinimleriyle örtüştüğüne inanıyorum.`
      : `${companyText !== "şirketiniz" ? addLocative(companyText) : companyText + " bünyesinde"} açık olan ${roleText} pozisyonuna başvurmaktan memnuniyet duyuyorum. Sahip olduğum birikim ve yetkinliklerin bu pozisyonun gereksinimlerini karşıladığını düşünüyorum.`;

    // Experience paragraph
    let experienceParagraph = "";
    const validExp = experience.filter((e) => e.title || e.company);
    if (validExp.length > 0) {
      const highlights = validExp
        .slice(0, 3)
        .map((exp) => {
          if (exp.title && exp.company) return `${addLocative(exp.company)} ${exp.title}`;
          if (exp.company) return exp.company;
          return exp.title;
        })
        .join(", ");
      experienceParagraph = `Profesyonel geçmişimde ${highlights} gibi deneyimler yer almaktadır. Bu süreçlerde problem çözme, ekip çalışması ve sorumluluk alma konularında kendimi geliştirdim. ${companyText !== "şirketiniz" ? companyText : "Şirketiniz"} bünyesinde de aynı kararlılık ve özeni göstermeyi hedefliyorum.`;
    } else {
      experienceParagraph = `Edindiğim bilgi ve becerilerimi ${companyText !== "şirketiniz" ? companyText : "şirketiniz"} bünyesinde uygulamak ve ekibinize değer katmak istiyorum.`;
    }

    const closing = `Başvurumu değerlendirdiğiniz için teşekkür ederim. Görüşme fırsatı yaratmanız hâlinde memnuniyetle katılırım.`;

    return [
      greeting,
      "",
      opening,
      "",
      experienceParagraph,
      "",
      closing,
      "",
      "Saygılarımla,",
      applicantName,
    ].join("\n");
  }

  // ── English ──────────────────────────────────────────────────────────────

  const greeting = hiringManagerName.trim()
    ? `Dear ${hiringManagerName},`
    : companyText !== "your company"
      ? `Dear ${companyText} Team,`
      : "Dear Hiring Manager,";

  const opening = summarySnippet
    ? `I am writing to express my strong interest in the ${roleText} position at ${companyText}. ${summarySnippet}. I believe this background aligns well with what you are looking for.`
    : `I am writing to express my strong interest in the ${roleText} position at ${companyText}. I am confident that my skills and experience make me a strong candidate for this role.`;

  const validExp = experience.filter((e) => e.title || e.company);
  const experienceParagraph =
    validExp.length > 0
      ? (() => {
          const highlights = validExp
            .slice(0, 3)
            .map(
              (exp) =>
                `${exp.title ? exp.title : ""}${exp.title && exp.company ? " at " : ""}${exp.company ? exp.company : ""}${exp.location ? ` (${exp.location})` : ""}`
            )
            .join("; ");
          return `My professional experience includes ${highlights}. Throughout these roles, I have consistently delivered results, collaborated with cross-functional teams, and shown a strong commitment to quality. I am excited to bring this experience to ${companyText} and contribute to your team's continued success.`;
        })()
      : `I am eager to bring my skills and dedication to ${companyText} and would welcome the opportunity to discuss how I can contribute to your team.`;

  return [
    greeting,
    "",
    opening,
    "",
    experienceParagraph,
    "",
    `Thank you for considering my application. I look forward to the possibility of discussing this opportunity further.`,
    "",
    "Best regards,",
    applicantName,
  ].join("\n");
}

export function generateEmailBody(
  coverLetter: string,
  personalInfo: PersonalInfo,
  role?: string,
  language: CoverLetterLanguage = "en"
): string {
  const position =
    role?.trim() || (language === "tr" ? "[Pozisyon]" : "[Position]");
  const name =
    personalInfo.name.trim() ||
    (language === "tr" ? "Başvuru Sahibi" : "Applicant");
  const subject =
    language === "tr"
      ? `Konu: ${position} Pozisyonu Başvurusu — ${name}`
      : `Subject: Application for ${position} — ${name}`;
  return [subject, "", "---", "", coverLetter].join("\n");
}
