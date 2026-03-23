"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import {
  Plus,
  Trash2,
  Copy,
  Download,
  FileText,
  Mail,
  RotateCcw,
  MapPin,
  Linkedin,
  Github,
} from "lucide-react";
import type {
  PersonalInfo,
  ExperienceItem,
  EducationItem,
  SimpleListItem,
  ProjectItem,
  CertificateItem,
} from "@/types";
import { generateCoverLetter, generateEmailBody } from "@/lib/generateCoverLetter";

const emptyPersonalInfo: PersonalInfo = {
  name: "",
  professionalTitle: "",
  email: "",
  phone: "",
  address: "",
  linkedin: "",
  github: "",
  summary: "",
};

const createExperienceItem = (id: string): ExperienceItem => ({
  id,
  title: "",
  company: "",
  location: "",
  startDate: "",
  endDate: "",
  current: false,
  description: "",
});

const createEducationItem = (id: string): EducationItem => ({
  id,
  degree: "",
  institution: "",
  location: "",
  startDate: "",
  endDate: "",
  details: "",
});

function normalizeUrlForHref(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function normalizeUrlForDisplay(input: string): string {
  const href = normalizeUrlForHref(input);
  return href.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

const createSimpleListItem = (id: string): SimpleListItem => ({
  id,
  value: "",
});

const createProjectItem = (id: string): ProjectItem => ({
  id,
  name: "",
  date: "",
  description: "",
});

const createCertificateItem = (id: string): CertificateItem => ({
  id,
  name: "",
  date: "",
});

function CopyButton({
  text,
  label,
}: {
  text: string;
  label: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text.trim()) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 hover:border-stone-300 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Copy className="h-4 w-4" />
      {copied ? "Copied!" : label}
    </button>
  );
}

function CopyButtonLocalized({
  text,
  label,
  language,
}: {
  text: string;
  label: string;
  language: "en" | "tr";
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text.trim()) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 hover:border-stone-300 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Copy className="h-4 w-4" />
      {copied ? (language === "tr" ? "Kopyalandı!" : "Copied!") : label}
    </button>
  );
}

export default function CVBuilder() {
  const [mode, setMode] = useState<"cv" | "cover">("cv");
  const [personalInfo, setPersonalInfo] =
    useState<PersonalInfo>(emptyPersonalInfo);
  const [experience, setExperience] = useState<ExperienceItem[]>(() => [
    createExperienceItem("exp-0"),
  ]);
  const [education, setEducation] = useState<EducationItem[]>(() => [
    createEducationItem("edu-0"),
  ]);
  const [skills, setSkills] = useState<SimpleListItem[]>(() => [
    createSimpleListItem("skill-0"),
  ]);
  const [languages, setLanguages] = useState<SimpleListItem[]>(() => [
    createSimpleListItem("lang-0"),
  ]);
  const [projects, setProjects] = useState<ProjectItem[]>(() => [
    createProjectItem("proj-0"),
  ]);
  const [certificates, setCertificates] = useState<CertificateItem[]>(() => [
    createCertificateItem("cert-0"),
  ]);
  const nextExpId = useRef(1);
  const nextEduId = useRef(1);
  const nextSkillId = useRef(1);
  const nextLangId = useRef(1);
  const nextProjectId = useRef(1);
  const nextCertId = useRef(1);
  const [companyName, setCompanyName] = useState("");
  const [hiringManagerName, setHiringManagerName] = useState("");
  const [role, setRole] = useState("");
  const [language, setLanguage] = useState<"en" | "tr">("en");
  const [editedCoverLetterText, setEditedCoverLetterText] = useState("");
  const [hasManuallyEdited, setHasManuallyEdited] = useState(false);

  const addExperience = useCallback(() => {
    const id = `exp-${nextExpId.current++}`;
    setExperience((prev) => [...prev, createExperienceItem(id)]);
  }, []);

  const removeExperience = useCallback((id: string) => {
    setExperience((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const updateExperience = useCallback(
    (id: string, updates: Partial<ExperienceItem>) => {
      setExperience((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
      );
    },
    []
  );

  const addEducation = useCallback(() => {
    const id = `edu-${nextEduId.current++}`;
    setEducation((prev) => [...prev, createEducationItem(id)]);
  }, []);

  const removeEducation = useCallback((id: string) => {
    setEducation((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const updateEducation = useCallback(
    (id: string, updates: Partial<EducationItem>) => {
      setEducation((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
      );
    },
    []
  );

  const addSkill = useCallback(() => {
    const id = `skill-${nextSkillId.current++}`;
    setSkills((prev) => [...prev, createSimpleListItem(id)]);
  }, []);

  const removeSkill = useCallback((id: string) => {
    setSkills((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const updateSkill = useCallback(
    (id: string, value: string) => {
      setSkills((prev) =>
        prev.map((s) => (s.id === id ? { ...s, value } : s))
      );
    },
    []
  );

  const addLanguage = useCallback(() => {
    const id = `lang-${nextLangId.current++}`;
    setLanguages((prev) => [...prev, createSimpleListItem(id)]);
  }, []);

  const removeLanguage = useCallback((id: string) => {
    setLanguages((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const updateLanguage = useCallback(
    (id: string, value: string) => {
      setLanguages((prev) =>
        prev.map((l) => (l.id === id ? { ...l, value } : l))
      );
    },
    []
  );

  const addProject = useCallback(() => {
    const id = `proj-${nextProjectId.current++}`;
    setProjects((prev) => [...prev, createProjectItem(id)]);
  }, []);

  const removeProject = useCallback((id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updateProject = useCallback(
    (id: string, updates: Partial<ProjectItem>) => {
      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    },
    []
  );

  const addCertificate = useCallback(() => {
    const id = `cert-${nextCertId.current++}`;
    setCertificates((prev) => [...prev, createCertificateItem(id)]);
  }, []);

  const removeCertificate = useCallback((id: string) => {
    setCertificates((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const updateCertificate = useCallback(
    (id: string, updates: Partial<CertificateItem>) => {
      setCertificates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
      );
    },
    []
  );

  const coverLetterAutoText = useMemo(
    () =>
      generateCoverLetter(
        personalInfo,
        experience,
        companyName,
        hiringManagerName,
        role,
        language
      ),
    [personalInfo, experience, companyName, hiringManagerName, role, language]
  );

  const effectiveCoverLetterText = hasManuallyEdited
    ? editedCoverLetterText
    : coverLetterAutoText;

  const emailBodyText = useMemo(
    () =>
      generateEmailBody(
        effectiveCoverLetterText,
        personalInfo,
        role,
        language
      ),
    [effectiveCoverLetterText, personalInfo, role, language]
  );

  const handleExportPDF = async () => {
    const element = document.getElementById("preview-content");
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png", 1.0);
    const pdf = new jsPDF({ format: "a4", unit: "mm" });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    const pageHeight = pdf.internal.pageSize.getHeight();
    const totalPages = Math.max(1, Math.ceil(pdfHeight / pageHeight));

    // Render the full preview image across multiple PDF pages.
    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      if (pageIndex > 0) pdf.addPage();
      pdf.addImage(
        imgData,
        "PNG",
        0,
        -(pageIndex * pageHeight),
        pdfWidth,
        pdfHeight
      );
    }

    // Best-effort clickable links (requires URL text in the preview).
    if (mode === "cv") {
      const elementRect = element.getBoundingClientRect();
      if (elementRect.width > 0 && elementRect.height > 0) {
        const anchors = Array.from(
          element.querySelectorAll<HTMLAnchorElement>(
            'a[data-cv-link="true"]'
          )
        );

        anchors.forEach((a) => {
          const href = a.getAttribute("href") || "";
          if (!href) return;

          const rect = a.getBoundingClientRect();
          if (rect.width <= 0 || rect.height <= 0) return;

          const leftCss = rect.left - elementRect.left;
          const topCss = rect.top - elementRect.top;

          const leftMm = leftCss * (pdfWidth / elementRect.width);
          const topMm = topCss * (pdfHeight / elementRect.height);
          const widthMm = rect.width * (pdfWidth / elementRect.width);
          const heightMm = rect.height * (pdfHeight / elementRect.height);

          const pageIndex = Math.floor(topMm / pageHeight);
          if (pageIndex < 0 || pageIndex >= totalPages) return;

          pdf.setPage(pageIndex + 1);
          pdf.link(
            leftMm,
            topMm - pageIndex * pageHeight,
            widthMm,
            heightMm,
            { url: href }
          );
        });
      }
    }

    pdf.save(
      `${personalInfo.name || "document"}-${mode === "cv" ? "cv" : "cover-letter"}.pdf`
    );
  };

  const [mobilePanel, setMobilePanel] = useState<"form" | "preview">("form");

  const inputClass =
    "w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 transition-colors";
  const labelClass = "block text-xs font-medium text-stone-600 mb-1";

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="shrink-0 border-b border-stone-200 bg-white px-4 py-3 md:px-6 md:py-4">
        {/* Top row: logo + language + export */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-base font-semibold tracking-tight text-stone-900 shrink-0 md:text-lg">
            ApplyFlow
          </h1>

          <div className="flex items-center gap-2 shrink-0">
            {/* Language */}
            <div className="inline-flex rounded-lg border border-stone-200 bg-stone-50 p-0.5 md:p-1">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors md:px-3 md:py-1.5 ${
                  language === "en"
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage("tr")}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors md:px-3 md:py-1.5 ${
                  language === "tr"
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                TR
              </button>
            </div>
            <button
              type="button"
              onClick={handleExportPDF}
              className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-stone-800 md:px-4 md:py-2 md:text-sm"
            >
              <Download className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden sm:inline">{language === "tr" ? "PDF İndir" : "Export PDF"}</span>
              <span className="sm:hidden">PDF</span>
            </button>
          </div>
        </div>

        {/* Bottom row on mobile: CV / Cover Letter + Form / Preview tabs */}
        <div className="flex items-center justify-between gap-2 mt-2 md:hidden">
          {/* Mode switcher */}
          <div className="inline-flex rounded-lg border border-stone-200 bg-stone-50 p-0.5">
            <button
              type="button"
              onClick={() => setMode("cv")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                mode === "cv"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              CV
            </button>
            <button
              type="button"
              onClick={() => setMode("cover")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                mode === "cover"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              {language === "tr" ? "Ön Yazı" : "Cover Letter"}
            </button>
          </div>

          {/* Form / Preview panel switcher (mobile only) */}
          <div className="inline-flex rounded-lg border border-stone-200 bg-stone-50 p-0.5">
            <button
              type="button"
              onClick={() => setMobilePanel("form")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                mobilePanel === "form"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              {language === "tr" ? "Form" : "Form"}
            </button>
            <button
              type="button"
              onClick={() => setMobilePanel("preview")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                mobilePanel === "preview"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              {language === "tr" ? "Önizleme" : "Preview"}
            </button>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 min-h-0">
        {/* Left: Forms — full width on mobile, fixed width on desktop */}
        <div className={`${mobilePanel === "form" ? "flex" : "hidden"} md:flex w-full md:w-[420px] shrink-0 flex-col overflow-y-auto border-r border-stone-200 bg-white`}>
          {/* Desktop-only mode switcher inside form panel */}
          <div className="hidden md:flex items-center gap-1 px-6 pt-5 pb-0">
            <div className="inline-flex rounded-lg border border-stone-200 bg-stone-50 p-1">
              <button
                type="button"
                onClick={() => setMode("cv")}
                className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                  mode === "cv"
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <FileText className="h-4 w-4" />
                CV
              </button>
              <button
                type="button"
                onClick={() => setMode("cover")}
                className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                  mode === "cover"
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <Mail className="h-4 w-4" />
                {language === "tr" ? "Ön Yazı" : "Cover Letter"}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-8 p-6">
            {/* CV Form - shown when mode is CV */}
            {mode === "cv" && (
              <>
            {/* Personal Info */}
            <section className="order-1">
              <h2 className="text-sm font-semibold text-stone-800">
                {language === "tr" ? "Kişisel Bilgiler" : "Personal Info"}
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="personal-name" className={labelClass}>
                    {language === "tr" ? "Ad Soyad" : "Name"}
                  </label>
                  <input
                    id="personal-name"
                    type="text"
                    value={personalInfo.name}
                    onChange={(e) =>
                      setPersonalInfo((p) => ({ ...p, name: e.target.value }))
                    }
                    className={inputClass}
                    placeholder={language === "tr" ? "Ad ve soyadınız" : "Full name"}
                  />
                </div>
                <div>
                  <label htmlFor="personal-professional-title" className={labelClass}>
                    {language === "tr" ? "Profesyonel Unvan" : "Professional Title"}
                  </label>
                  <input
                    id="personal-professional-title"
                    type="text"
                    value={personalInfo.professionalTitle}
                    onChange={(e) =>
                      setPersonalInfo((p) => ({
                        ...p,
                        professionalTitle: e.target.value,
                      }))
                    }
                    className={inputClass}
                    placeholder={language === "tr" ? "Örn. Yazılım Mühendisi" : "e.g. Software Engineer"}
                  />
                </div>
                <div>
                  <label htmlFor="personal-email" className={labelClass}>
                    {language === "tr" ? "E-posta" : "Email"}
                  </label>
                  <input
                    id="personal-email"
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) =>
                      setPersonalInfo((p) => ({ ...p, email: e.target.value }))
                    }
                    className={inputClass}
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="personal-phone" className={labelClass}>
                    {language === "tr" ? "Telefon" : "Phone"}
                  </label>
                  <input
                    id="personal-phone"
                    type="tel"
                    value={personalInfo.phone}
                    onChange={(e) =>
                      setPersonalInfo((p) => ({ ...p, phone: e.target.value }))
                    }
                    className={inputClass}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div>
                  <label htmlFor="personal-address" className={labelClass}>
                    {language === "tr"
                      ? "Konum/Adres"
                      : "Location/Address"}
                  </label>
                  <input
                    id="personal-address"
                    type="text"
                    value={personalInfo.address}
                    onChange={(e) =>
                      setPersonalInfo((p) => ({
                        ...p,
                        address: e.target.value,
                      }))
                    }
                    className={inputClass}
                    placeholder={
                      language === "tr" ? "Örn. İstanbul, Türkiye" : "e.g. Istanbul, Turkey"
                    }
                  />
                </div>
                <div>
                  <label htmlFor="personal-linkedin" className={labelClass}>
                    {language === "tr" ? "LinkedIn Bağlantısı" : "LinkedIn Link"}
                  </label>
                  <input
                    id="personal-linkedin"
                    type="url"
                    value={personalInfo.linkedin}
                    onChange={(e) =>
                      setPersonalInfo((p) => ({
                        ...p,
                        linkedin: e.target.value,
                      }))
                    }
                    className={inputClass}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div>
                  <label htmlFor="personal-github" className={labelClass}>
                    {language === "tr" ? "GitHub Bağlantısı" : "GitHub Link"}
                  </label>
                  <input
                    id="personal-github"
                    type="url"
                    value={personalInfo.github}
                    onChange={(e) =>
                      setPersonalInfo((p) => ({
                        ...p,
                        github: e.target.value,
                      }))
                    }
                    className={inputClass}
                    placeholder="https://github.com/username"
                  />
                </div>
                <div>
                  <label htmlFor="personal-summary" className={labelClass}>
                    {language === "tr" ? "Profesyonel Özet" : "Professional Summary"}
                  </label>
                  <textarea
                    id="personal-summary"
                    value={personalInfo.summary}
                    onChange={(e) =>
                      setPersonalInfo((p) => ({ ...p, summary: e.target.value }))
                    }
                    className={`${inputClass} min-h-[100px] resize-y`}
                    placeholder={
                      language === "tr"
                        ? "Kendinizi kısaca tanıtın ve güçlü yönlerinizi belirtin..."
                        : "Brief overview of your background and key strengths..."
                    }
                    rows={4}
                  />
                </div>
              </div>
            </section>

            {/* Skills */}
            <section className="order-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-stone-800">
                  {language === "tr" ? "Yetenekler" : "Skills"}
                </h2>
                <button
                  type="button"
                  onClick={addSkill}
                  className="inline-flex items-center gap-1.5 rounded-md border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
                >
                  <Plus className="h-4 w-4" />
                  {language === "tr" ? "Ekle" : "Add"}
                </button>
              </div>
              <div className="space-y-4">
                {skills.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-xl border border-stone-200 bg-stone-50/50 p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-medium text-stone-500">
                        {language === "tr" ? "Yetenek" : "Skill"}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSkill(s.id)}
                        className="text-stone-400 hover:text-red-600 p-1"
                        aria-label={language === "tr" ? "Yetenek kaldır" : "Remove skill"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={s.value}
                      onChange={(e) => updateSkill(s.id, e.target.value)}
                      className={inputClass}
                      placeholder={language === "tr" ? "Örn. React" : "e.g. React"}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Languages */}
            <section className="order-7">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-stone-800">
                  {language === "tr" ? "Diller" : "Languages"}
                </h2>
                <button
                  type="button"
                  onClick={addLanguage}
                  className="inline-flex items-center gap-1.5 rounded-md border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
                >
                  <Plus className="h-4 w-4" />
                  {language === "tr" ? "Ekle" : "Add"}
                </button>
              </div>
              <div className="space-y-4">
                {languages.map((l) => (
                  <div
                    key={l.id}
                    className="rounded-xl border border-stone-200 bg-stone-50/50 p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-medium text-stone-500">
                        {language === "tr" ? "Dil" : "Language"}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeLanguage(l.id)}
                        className="text-stone-400 hover:text-red-600 p-1"
                        aria-label={language === "tr" ? "Dil kaldır" : "Remove language"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={l.value}
                      onChange={(e) => updateLanguage(l.id, e.target.value)}
                      className={inputClass}
                      placeholder={language === "tr" ? "Örn. İngilizce (İleri)" : "e.g. English (Advanced)"}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Projects */}
            <section className="order-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-stone-800">
                  {language === "tr" ? "Projeler" : "Projects"}
                </h2>
                <button
                  type="button"
                  onClick={addProject}
                  className="inline-flex items-center gap-1.5 rounded-md border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
                >
                  <Plus className="h-4 w-4" />
                  {language === "tr" ? "Ekle" : "Add"}
                </button>
              </div>
              <div className="space-y-6">
                {projects.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl border border-stone-200 bg-stone-50/50 p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-medium text-stone-500">
                        {language === "tr" ? "Proje" : "Project"}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeProject(p.id)}
                        className="text-stone-400 hover:text-red-600 p-1"
                        aria-label={language === "tr" ? "Proje kaldır" : "Remove project"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor={`proj-name-${p.id}`} className={labelClass}>
                          {language === "tr" ? "Proje Adı" : "Project Name"}
                        </label>
                        <input
                          id={`proj-name-${p.id}`}
                          type="text"
                          value={p.name}
                          onChange={(e) =>
                            updateProject(p.id, { name: e.target.value })
                          }
                          className={inputClass}
                          placeholder={language === "tr" ? "Örn. CV Builder" : "e.g. CV Builder"}
                        />
                      </div>
                      <div>
                        <label htmlFor={`proj-date-${p.id}`} className={labelClass}>
                          {language === "tr" ? "Tarih" : "Date"}
                        </label>
                        <input
                          id={`proj-date-${p.id}`}
                          type="text"
                          value={p.date}
                          onChange={(e) =>
                            updateProject(p.id, { date: e.target.value })
                          }
                          className={inputClass}
                          placeholder={language === "tr" ? "Örn. 2025" : "e.g. 2025"}
                        />
                      </div>
                      <div className="col-span-1 sm:col-span-2">
                        <label
                          htmlFor={`proj-desc-${p.id}`}
                          className={labelClass}
                        >
                          {language === "tr" ? "Açıklama" : "Description"}
                        </label>
                        <textarea
                          id={`proj-desc-${p.id}`}
                          value={p.description}
                          onChange={(e) =>
                            updateProject(p.id, { description: e.target.value })
                          }
                          className={`${inputClass} min-h-[80px] resize-y`}
                          placeholder={
                            language === "tr"
                              ? "Neyi geliştirdiniz? Öne çıkan sonuçlar..."
                              : "What you built? Key outcomes..."
                          }
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Certificates */}
            <section className="order-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-stone-800">
                  {language === "tr" ? "Sertifikalar" : "Certificates"}
                </h2>
                <button
                  type="button"
                  onClick={addCertificate}
                  className="inline-flex items-center gap-1.5 rounded-md border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
                >
                  <Plus className="h-4 w-4" />
                  {language === "tr" ? "Ekle" : "Add"}
                </button>
              </div>
              <div className="space-y-6">
                {certificates.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-xl border border-stone-200 bg-stone-50/50 p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-medium text-stone-500">
                        {language === "tr" ? "Sertifika" : "Certificate"}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeCertificate(c.id)}
                        className="text-stone-400 hover:text-red-600 p-1"
                        aria-label={language === "tr" ? "Sertifika kaldır" : "Remove certificate"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor={`cert-name-${c.id}`} className={labelClass}>
                          {language === "tr" ? "Sertifika Adı" : "Certificate Name"}
                        </label>
                        <input
                          id={`cert-name-${c.id}`}
                          type="text"
                          value={c.name}
                          onChange={(e) =>
                            updateCertificate(c.id, { name: e.target.value })
                          }
                          className={inputClass}
                          placeholder={language === "tr" ? "Örn. AWS Certified" : "e.g. AWS Certified"}
                        />
                      </div>
                      <div>
                        <label htmlFor={`cert-date-${c.id}`} className={labelClass}>
                          {language === "tr" ? "Tarih" : "Date"}
                        </label>
                        <input
                          id={`cert-date-${c.id}`}
                          type="text"
                          value={c.date}
                          onChange={(e) =>
                            updateCertificate(c.id, { date: e.target.value })
                          }
                          className={inputClass}
                          placeholder={language === "tr" ? "Örn. 2024" : "e.g. 2024"}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Experience */}
            <section className="order-3">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-stone-800">
                  {language === "tr" ? "Deneyim" : "Experience"}
                </h2>
                <button
                  type="button"
                  onClick={addExperience}
                  className="inline-flex items-center gap-1.5 rounded-md border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
                >
                  <Plus className="h-4 w-4" />
                  {language === "tr" ? "Ekle" : "Add"}
                </button>
              </div>
              <div className="space-y-6">
                {experience.map((exp, expIndex) => (
                  <div
                    key={exp.id}
                    className="rounded-xl border border-stone-200 bg-stone-50/50 p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-medium text-stone-500">
                        {language === "tr" ? "Deneyim" : "Experience"}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeExperience(exp.id)}
                        className="text-stone-400 hover:text-red-600 p-1"
                        aria-label={language === "tr" ? "Deneyim kaldır" : "Remove experience"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2 sm:col-span-1">
                        <label htmlFor={`exp-title-${expIndex}`} className={labelClass}>
                          {language === "tr" ? "Unvan" : "Title"}
                        </label>
                        <input
                          id={`exp-title-${expIndex}`}
                          type="text"
                          value={exp.title}
                          onChange={(e) =>
                            updateExperience(exp.id, { title: e.target.value })
                          }
                          className={inputClass}
                          placeholder={language === "tr" ? "İş unvanı" : "Job title"}
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label htmlFor={`exp-company-${expIndex}`} className={labelClass}>
                          {language === "tr" ? "Şirket" : "Company"}
                        </label>
                        <input
                          id={`exp-company-${expIndex}`}
                          type="text"
                          value={exp.company}
                          onChange={(e) =>
                            updateExperience(exp.id, {
                              company: e.target.value,
                            })
                          }
                          className={inputClass}
                          placeholder={language === "tr" ? "Şirket adı" : "Company name"}
                        />
                      </div>
                      <div>
                        <label htmlFor={`exp-start-${expIndex}`} className={labelClass}>
                          {language === "tr" ? "Başlangıç" : "Start"}
                        </label>
                        <input
                          id={`exp-start-${expIndex}`}
                          type="text"
                          value={exp.startDate}
                          onChange={(e) =>
                            updateExperience(exp.id, {
                              startDate: e.target.value,
                            })
                          }
                          className={inputClass}
                          placeholder={language === "tr" ? "Örn. Oca 2020" : "e.g. Jan 2020"}
                        />
                      </div>
                      <div>
                        <label htmlFor={`exp-end-${expIndex}`} className={labelClass}>
                          {language === "tr" ? "Bitiş" : "End"}
                        </label>
                        <input
                          id={`exp-end-${expIndex}`}
                          type="text"
                          value={exp.endDate}
                          onChange={(e) =>
                            updateExperience(exp.id, { endDate: e.target.value })
                          }
                          className={inputClass}
                          placeholder={language === "tr" ? "Örn. Devam ediyor" : "e.g. Present"}
                          disabled={exp.current}
                        />
                      </div>
                      <div className="col-span-2 flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`exp-current-${expIndex}`}
                          checked={exp.current}
                          onChange={(e) =>
                            updateExperience(exp.id, {
                              current: e.target.checked,
                              endDate: e.target.checked ? (language === "tr" ? "Devam ediyor" : "Present") : "",
                            })
                          }
                          className="rounded border-stone-300"
                        />
                        <label
                          htmlFor={`exp-current-${expIndex}`}
                          className="text-sm text-stone-600"
                        >
                          {language === "tr" ? "Hâlâ devam ediyor" : "Current role"}
                        </label>
                      </div>
                      <div className="col-span-2">
                        <label htmlFor={`exp-description-${expIndex}`} className={labelClass}>
                          {language === "tr" ? "Açıklama" : "Description"}
                        </label>
                        <textarea
                          id={`exp-description-${expIndex}`}
                          value={exp.description}
                          onChange={(e) =>
                            updateExperience(exp.id, {
                              description: e.target.value,
                            })
                          }
                          className={`${inputClass} min-h-[80px] resize-y`}
                          placeholder={
                            language === "tr"
                              ? "Temel sorumluluklar ve başarılar..."
                              : "Key responsibilities and achievements..."
                          }
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Education */}
            <section className="order-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-stone-800">
                  {language === "tr" ? "Eğitim" : "Education"}
                </h2>
                <button
                  type="button"
                  onClick={addEducation}
                  className="inline-flex items-center gap-1.5 rounded-md border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
                >
                  <Plus className="h-4 w-4" />
                  {language === "tr" ? "Ekle" : "Add"}
                </button>
              </div>
              <div className="space-y-6">
                {education.map((edu, eduIndex) => (
                  <div
                    key={edu.id}
                    className="rounded-xl border border-stone-200 bg-stone-50/50 p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-medium text-stone-500">
                        {language === "tr" ? "Eğitim" : "Education"}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeEducation(edu.id)}
                        className="text-stone-400 hover:text-red-600 p-1"
                        aria-label={language === "tr" ? "Eğitim kaldır" : "Remove education"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2 sm:col-span-1">
                        <label htmlFor={`edu-degree-${eduIndex}`} className={labelClass}>
                          {language === "tr" ? "Derece / Bölüm" : "Degree"}
                        </label>
                        <input
                          id={`edu-degree-${eduIndex}`}
                          type="text"
                          value={edu.degree}
                          onChange={(e) =>
                            updateEducation(edu.id, {
                              degree: e.target.value,
                            })
                          }
                          className={inputClass}
                          placeholder={language === "tr" ? "Örn. Bilgisayar Mühendisliği" : "e.g. B.S. Computer Science"}
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label htmlFor={`edu-institution-${eduIndex}`} className={labelClass}>
                          {language === "tr" ? "Kurum" : "Institution"}
                        </label>
                        <input
                          id={`edu-institution-${eduIndex}`}
                          type="text"
                          value={edu.institution}
                          onChange={(e) =>
                            updateEducation(edu.id, {
                              institution: e.target.value,
                            })
                          }
                          className={inputClass}
                          placeholder={language === "tr" ? "Üniversite adı" : "University name"}
                        />
                      </div>
                      <div>
                        <label htmlFor={`edu-start-${eduIndex}`} className={labelClass}>
                          {language === "tr" ? "Başlangıç" : "Start"}
                        </label>
                        <input
                          id={`edu-start-${eduIndex}`}
                          type="text"
                          value={edu.startDate}
                          onChange={(e) =>
                            updateEducation(edu.id, {
                              startDate: e.target.value,
                            })
                          }
                          className={inputClass}
                          placeholder={language === "tr" ? "Örn. 2016" : "e.g. 2016"}
                        />
                      </div>
                      <div>
                        <label htmlFor={`edu-end-${eduIndex}`} className={labelClass}>
                          {language === "tr" ? "Bitiş" : "End"}
                        </label>
                        <input
                          id={`edu-end-${eduIndex}`}
                          type="text"
                          value={edu.endDate}
                          onChange={(e) =>
                            updateEducation(edu.id, {
                              endDate: e.target.value,
                            })
                          }
                          className={inputClass}
                          placeholder={language === "tr" ? "Örn. 2020" : "e.g. 2020"}
                        />
                      </div>
                      <div className="col-span-2">
                        <label htmlFor={`edu-details-${eduIndex}`} className={labelClass}>
                          {language === "tr" ? "Detaylar (isteğe bağlı)" : "Details (optional)"}
                        </label>
                        <input
                          id={`edu-details-${eduIndex}`}
                          type="text"
                          value={edu.details || ""}
                          onChange={(e) =>
                            updateEducation(edu.id, {
                              details: e.target.value,
                            })
                          }
                          className={inputClass}
                          placeholder={language === "tr" ? "Onur, kulüpler vb." : "Honors, activities, etc."}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
              </>
            )}

            {/* Cover Letter Form - shown when mode is Cover Letter */}
            {mode === "cover" && (
              <section>
                <h2 className="text-sm font-semibold text-stone-800">
                  {language === "tr" ? "Kapak Mektubu Bilgileri" : "Cover Letter Details"}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="cover-company" className={labelClass}>
                      {language === "tr" ? "Şirket Adı" : "Company Name"}
                    </label>
                    <input
                      id="cover-company"
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className={inputClass}
                      placeholder={language === "tr" ? "Örn. Acme A.Ş." : "e.g. Acme Inc."}
                    />
                  </div>
                  <div>
                    <label htmlFor="cover-recipient" className={labelClass}>
                      {language === "tr" ? "Alıcı Adı" : "Recipient Name"}
                    </label>
                    <input
                      id="cover-recipient"
                      type="text"
                      value={hiringManagerName}
                      onChange={(e) => setHiringManagerName(e.target.value)}
                      className={inputClass}
                      placeholder={language === "tr" ? "Örn. Ayşe Kaya (isteğe bağlı)" : "e.g. Jane Smith (optional)"}
                    />
                  </div>
                  <div>
                    <label htmlFor="cover-role" className={labelClass}>
                      {language === "tr" ? "Pozisyon / İş Rolü" : "Job Role"}
                    </label>
                    <input
                      id="cover-role"
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className={inputClass}
                      placeholder={language === "tr" ? "Örn. Kıdemli Yazılım Mühendisi" : "e.g. Senior Software Engineer"}
                    />
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Right: Live Preview - hidden on mobile when form tab is active */}
        <div className={`${mobilePanel === "preview" ? "flex" : "hidden"} md:flex flex-1 min-w-0 flex-col overflow-y-auto bg-stone-100 p-4 md:p-8 items-center`}>
          <div className="w-full max-w-[210mm]">
            {mode === "cv" ? (
              <div
                id="preview-content"
                className="rounded-lg border border-stone-200 bg-white p-6 md:p-10 shadow-sm"
              >
                <CVPreview
                  personalInfo={personalInfo}
                  experience={experience}
                  education={education}
                  skills={skills}
                  languages={languages}
                  projects={projects}
                  certificates={certificates}
                  language={language}
                />
              </div>
            ) : (
              <div className="space-y-6">
                <div
                  id="preview-content"
                  className="rounded-lg border border-stone-200 bg-white p-6 md:p-10 shadow-sm w-full"
                >
                  <CoverLetterPreview
                    personalInfo={personalInfo}
                    coverLetterText={effectiveCoverLetterText}
                    hasManuallyEdited={hasManuallyEdited}
                    onTextChange={(text) => {
                      setEditedCoverLetterText(text);
                      setHasManuallyEdited(true);
                    }}
                    onReset={() => setHasManuallyEdited(false)}
                    language={language}
                  />
                </div>
                <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-stone-800">
                      {language === "tr"
                        ? "Kullanıma Hazır E-posta İçeriği"
                        : "Ready-to-use Email Body"}
                    </h3>
                    <CopyButtonLocalized
                      text={emailBodyText}
                      label={language === "tr" ? "E-postayı Kopyala" : "Copy Email"}
                      language={language}
                    />
                  </div>
                  <pre className="whitespace-pre-wrap rounded-lg bg-stone-50 p-4 text-sm text-stone-700 font-sans overflow-x-auto">
                    {emailBodyText}
                  </pre>
                </div>
                <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-stone-800">
                      {language === "tr"
                        ? "Kapak Mektubu Metni"
                        : "Cover Letter Text"}
                    </h3>
                    <CopyButtonLocalized
                      text={effectiveCoverLetterText}
                      label={
                        language === "tr"
                          ? "Kapak Mektubunu Kopyala"
                          : "Copy Cover Letter"
                      }
                      language={language}
                    />
                  </div>
                  <pre className="whitespace-pre-wrap rounded-lg bg-stone-50 p-4 text-sm text-stone-700 font-sans overflow-x-auto">
                    {effectiveCoverLetterText}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CVPreview({
  personalInfo,
  experience,
  education,
  skills,
  languages,
  projects,
  certificates,
  language,
}: {
  personalInfo: PersonalInfo;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SimpleListItem[];
  languages: SimpleListItem[];
  projects: ProjectItem[];
  certificates: CertificateItem[];
  language: "en" | "tr";
}) {
  const labels = {
    experience: language === "tr" ? "Deneyim" : "Experience",
    education: language === "tr" ? "Eğitim" : "Education",
    skills: language === "tr" ? "Yetenekler" : "Skills",
    languages: language === "tr" ? "Diller" : "Languages",
    projects: language === "tr" ? "Projeler" : "Projects",
    certificates:
      language === "tr" ? "Sertifikalar" : "Certificates",
    summary: language === "tr" ? "Hakkımda" : "About",
    yourName: language === "tr" ? "Adınız" : "Your Name",
    emptyCv: language === "tr"
      ? "CV önizlemesini görmek için formu doldurun"
      : "Fill in the form to see your CV preview",
  };

  const hasContent =
    personalInfo.name ||
    personalInfo.professionalTitle ||
    personalInfo.email ||
    personalInfo.phone ||
    personalInfo.address ||
    personalInfo.linkedin ||
    personalInfo.github ||
    personalInfo.summary ||
    skills.some((s) => s.value.trim()) ||
    languages.some((l) => l.value.trim()) ||
    projects.some((p) => p.name || p.date || p.description) ||
    certificates.some((c) => c.name || c.date) ||
    experience.some(
      (e) => e.title || e.company || e.description
    ) ||
    education.some(
      (e) => e.degree || e.institution
    );

  if (!hasContent) {
    return (
      <div className="py-12 text-center text-stone-400 text-sm">
        {labels.emptyCv}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-stone-900">
      <div className="border-b border-stone-200 pb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          {personalInfo.name || labels.yourName}
        </h1>
        {personalInfo.professionalTitle && (
          <div className="mt-1 text-base font-semibold text-stone-700">
            {personalInfo.professionalTitle}
          </div>
        )}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-600">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.address && (
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-stone-400 shrink-0" />
              <span>{personalInfo.address}</span>
            </span>
          )}
          {personalInfo.linkedin && (
            <a
              href={normalizeUrlForHref(personalInfo.linkedin)}
              target="_blank"
              rel="noopener noreferrer"
              data-cv-link="true"
              className="inline-flex items-center gap-2 hover:text-stone-900 underline"
            >
              <Linkedin className="h-4 w-4 text-stone-400 shrink-0" />
              <span>{normalizeUrlForDisplay(personalInfo.linkedin)}</span>
            </a>
          )}
          {personalInfo.github && (
            <a
              href={normalizeUrlForHref(personalInfo.github)}
              target="_blank"
              rel="noopener noreferrer"
              data-cv-link="true"
              className="inline-flex items-center gap-2 hover:text-stone-900 underline"
            >
              <Github className="h-4 w-4 text-stone-400 shrink-0" />
              <span>{normalizeUrlForDisplay(personalInfo.github)}</span>
            </a>
          )}
        </div>
        {personalInfo.summary && (
          <div className="mt-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-2">
              {labels.summary}
            </h2>
            <p className="text-sm leading-relaxed text-stone-700">
              {personalInfo.summary}
            </p>
          </div>
        )}
      </div>

      {skills.some((s) => s.value.trim()) && (
        <section className="order-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-4">
            {labels.skills}
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills
              .filter((s) => s.value.trim())
              .map((s) => (
                <span
                  key={s.id}
                  className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-700"
                >
                  {s.value}
                </span>
              ))}
          </div>
        </section>
      )}

      {languages.some((l) => l.value.trim()) && (
        <section className="order-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-4">
            {labels.languages}
          </h2>
          <div className="flex flex-wrap gap-2">
            {languages
              .filter((l) => l.value.trim())
              .map((l) => (
                <span
                  key={l.id}
                  className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-700"
                >
                  {l.value}
                </span>
              ))}
          </div>
        </section>
      )}

      {experience.some((e) => e.title || e.company || e.description) && (
        <section className="order-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-4">
            {labels.experience}
          </h2>
          <div className="space-y-4">
            {experience
              .filter((e) => e.title || e.company || e.description)
              .map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline gap-2">
                    <h3 className="font-semibold text-stone-900">
                      {exp.title || (language === "tr" ? "İş Unvanı" : "Job Title")}
                    </h3>
                    <span className="text-xs text-stone-500 shrink-0">
                      {exp.startDate}
                      {exp.startDate && exp.endDate ? " — " : ""}
                      {exp.endDate}
                    </span>
                  </div>
                  <p className="text-sm text-stone-600">
                    {exp.company}
                    {exp.location && ` · ${exp.location}`}
                  </p>
                  {exp.description && (
                    <p className="mt-1 text-sm text-stone-700 whitespace-pre-wrap">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </section>
      )}

      {projects.some((p) => p.name || p.date || p.description) && (
        <section className="order-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-4">
            {labels.projects}
          </h2>
          <div className="space-y-4">
            {projects
              .filter((p) => p.name || p.date || p.description)
              .map((p) => (
                <div key={p.id}>
                  <div className="flex justify-between items-baseline gap-2">
                    <h3 className="font-semibold text-stone-900">
                      {p.name || (language === "tr" ? "Proje" : "Project")}
                    </h3>
                    <span className="text-xs text-stone-500 shrink-0">
                      {p.date}
                    </span>
                  </div>
                  {p.description && (
                    <p className="mt-1 text-sm text-stone-700 whitespace-pre-wrap">
                      {p.description}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </section>
      )}

      {education.some((e) => e.degree || e.institution) && (
        <section className="order-1">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-4">
            {labels.education}
          </h2>
          <div className="space-y-4">
            {education
              .filter((e) => e.degree || e.institution)
              .map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline gap-2">
                    <h3 className="font-semibold text-stone-900">
                      {edu.degree || (language === "tr" ? "Derece / Bölüm" : "Degree")}
                    </h3>
                    <span className="text-xs text-stone-500 shrink-0">
                      {edu.startDate}
                      {edu.startDate && edu.endDate ? " — " : ""}
                      {edu.endDate}
                    </span>
                  </div>
                  <p className="text-sm text-stone-600">
                    {edu.institution}
                    {edu.location && ` · ${edu.location}`}
                  </p>
                  {edu.details && (
                    <p className="mt-1 text-sm text-stone-700">{edu.details}</p>
                  )}
                </div>
              ))}
          </div>
        </section>
      )}

      {certificates.some((c) => c.name || c.date) && (
        <section className="order-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-4">
            {labels.certificates}
          </h2>
          <div className="space-y-4">
            {certificates
              .filter((c) => c.name || c.date)
              .map((c) => (
                <div key={c.id}>
                  <div className="flex justify-between items-baseline gap-2">
                    <h3 className="font-semibold text-stone-900">
                      {c.name || (language === "tr" ? "Sertifika" : "Certificate")}
                    </h3>
                    <span className="text-xs text-stone-500 shrink-0">
                      {c.date}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}

function CoverLetterPreview({
  personalInfo,
  coverLetterText,
  hasManuallyEdited,
  onTextChange,
  onReset,
  language,
}: {
  personalInfo: PersonalInfo;
  coverLetterText: string;
  hasManuallyEdited: boolean;
  onTextChange: (text: string) => void;
  onReset: () => void;
  language: "en" | "tr";
}) {
  const emptyMessage =
    language === "tr"
      ? "Kapak Mektubu Bilgileri sekmesinden şirket adı, alıcı ve pozisyonu girin; metin otomatik güncellenir."
      : "Enter company, recipient, and role in the Cover Letter Details tab — text updates automatically.";

  return (
    <div className="space-y-6 text-stone-900">
      <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {personalInfo.name || (language === "tr" ? "Adınız" : "Your Name")}
          </h1>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-600">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
          </div>
        </div>
        {hasManuallyEdited && (
          <button
            type="button"
            onClick={onReset}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50 hover:border-stone-300"
            title={language === "tr" ? "Otomatik metne sıfırla" : "Reset to auto-generated"}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {language === "tr" ? "Otomatik metne sıfırla" : "Reset to Auto-Generate"}
          </button>
        )}
      </div>
      <textarea
        value={coverLetterText}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder={emptyMessage}
        className="w-full min-h-[320px] resize-y rounded-none border-0 bg-transparent p-0 text-sm leading-relaxed text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-0 focus:border-0"
        style={{
          fontFamily: "inherit",
          lineHeight: 1.7,
        }}
        spellCheck
      />
    </div>
  );
}
