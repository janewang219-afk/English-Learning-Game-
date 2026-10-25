from __future__ import annotations

import json
import re
from pathlib import Path

from build_question_bank import final_questions, units


BANK_ID = "pep-grade3-first-term-2024"
BANK_TITLE = "三年级上册英语全年题库"
SOURCE_URL = "https://book.pep.com.cn/1212001301245/mobile/index.html"
FINAL_AUDIO_SCRIPT = (
    "This is Ben. He has a big family. He likes apples. He has a pet rabbit. "
    "The rabbit can hop. Ben is seven years old. His birthday party is at seven o’clock."
)
OUT = Path(__file__).parent / "playlearn-app" / "content" / "pep_grade3_first_term_question_bank.sql"


def sql_text(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def sql_json(value: object) -> str:
    encoded = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    return f"{sql_text(encoded)}::jsonb"


def sql_text_array(values: list[str]) -> str:
    return "ARRAY[" + ", ".join(sql_text(value) for value in values) + "]::text[]"


def extract_options(prompt: str) -> list[str] | None:
    matches = list(re.finditer(r"(?<![A-Za-z])([A-C])\.\s*", prompt))
    if len(matches) < 2:
        return None

    options: list[str] = []
    for index, match in enumerate(matches):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(prompt)
        option = prompt[match.end() : end].strip().rstrip("。")
        options.append(option)
    return options if len(options) >= 2 else None


def normalize_answer(raw_answer: str) -> str | list[str]:
    answer = raw_answer.strip()
    if re.fullmatch(r"[A-C]", answer):
        return answer

    choice_parts = [part.strip() for part in re.split(r"[，,]", answer)]
    if len(choice_parts) > 1 and all(re.fullmatch(r"[A-Z]", part) for part in choice_parts):
        return choice_parts

    truth_values = re.findall(r"\(\d+\)\s*([TF])", answer)
    if truth_values:
        return truth_values

    return answer


def section_key(label: str) -> str:
    if label.startswith("Part A"):
        return "letters_and_sounds"
    if label.startswith("Part B"):
        return "vocabulary"
    if label.startswith("Part C"):
        return "sentences"
    if label.startswith("Part D"):
        return "reading"
    return "listening_and_speaking"


def question_type(section: str, prompt: str, options: list[str] | None) -> str:
    if section == "final_review":
        if "听力" in prompt:
            return "listening"
        if "综合口语" in prompt:
            return "speaking"
    if section == "listening_and_speaking":
        if "听老师" in prompt or "听力" in prompt:
            return "listening"
        if "口语" in prompt:
            return "speaking"
        if "写一写" in prompt:
            return "writing"
    if section == "reading":
        if "判断正误" in prompt:
            return "true_false"
        return "short_answer"
    if "补全" in prompt or "填" in prompt or "__" in prompt or "______" in prompt:
        return "fill_blank"
    return "multiple_choice" if options else "short_answer"


def difficulty(unit_no: int, section: str) -> int:
    if unit_no == 0:
        return 3
    if section in {"letters_and_sounds", "vocabulary"}:
        return 1
    if section in {"sentences", "reading"}:
        return 2
    return 2


def make_record(
    *,
    unit_no: int,
    unit_title: str,
    section: str,
    position: int,
    prompt: str,
    raw_answer: str,
    audio_script: str | None,
) -> dict[str, object]:
    options = extract_options(prompt)
    q_type = question_type(section, prompt, options)
    return {
        "id": f"{BANK_ID}-{f'u{unit_no}' if unit_no else 'revision'}-q{position:02d}",
        "bank_id": BANK_ID,
        "unit_no": unit_no,
        "unit_title": unit_title,
        "section": section,
        "position": position,
        "question_type": q_type,
        "prompt": prompt,
        "options": options,
        "answer": normalize_answer(raw_answer),
        "answer_text": raw_answer,
        "audio_script": audio_script if q_type == "listening" else None,
        "difficulty_tier": difficulty(unit_no, section),
        "tags": ["pep-appendix", section, "revision" if unit_no == 0 else f"unit-{unit_no}"],
    }


def build_records() -> list[dict[str, object]]:
    records: list[dict[str, object]] = []
    for unit in units:
        position = 1
        for label, questions in unit["parts"]:
            section = section_key(label)
            for prompt, raw_answer in questions:
                records.append(
                    make_record(
                        unit_no=unit["no"],
                        unit_title=unit["title"],
                        section=section,
                        position=position,
                        prompt=prompt,
                        raw_answer=raw_answer,
                        audio_script=unit["script"],
                    )
                )
                position += 1

    position = 1
    for prompt, raw_answer in final_questions:
        records.append(
            make_record(
                unit_no=0,
                unit_title="Being a good guest",
                section="final_review",
                position=position,
                prompt=prompt,
                raw_answer=raw_answer,
                audio_script=FINAL_AUDIO_SCRIPT,
            )
        )
        position += 1
    return records


def sql_nullable_text(value: object) -> str:
    return "NULL" if value is None else sql_text(str(value))


def sql_nullable_json(value: object) -> str:
    return "NULL" if value is None else sql_json(value)


def question_values(record: dict[str, object]) -> str:
    return "(" + ", ".join(
        [
            sql_text(str(record["id"])),
            sql_text(str(record["bank_id"])),
            str(record["unit_no"]),
            sql_text(str(record["unit_title"])),
            sql_text(str(record["section"])),
            str(record["position"]),
            sql_text(str(record["question_type"])),
            sql_text(str(record["prompt"])),
            sql_nullable_json(record["options"]),
            sql_json(record["answer"]),
            sql_text(str(record["answer_text"])),
            sql_nullable_text(record["audio_script"]),
            str(record["difficulty_tier"]),
            sql_text_array([str(tag) for tag in record["tags"]]),
            "NOW()",
        ]
    ) + ")"


def build_sql(records: list[dict[str, object]]) -> str:
    values = ",\n".join(f"  {question_values(record)}" for record in records)
    return f"""-- PEP 三年级上册英语题库
-- PostgreSQL import script. Safe to run repeatedly: records are upserted by id.
-- Source: {SOURCE_URL}

BEGIN;

CREATE TABLE IF NOT EXISTS question_banks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade SMALLINT NOT NULL,
  term TEXT NOT NULL,
  curriculum_version TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_appendices JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  bank_id TEXT NOT NULL REFERENCES question_banks(id) ON DELETE CASCADE,
  unit_no SMALLINT NOT NULL,
  unit_title TEXT NOT NULL,
  section TEXT NOT NULL,
  position SMALLINT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN (
    'multiple_choice', 'fill_blank', 'true_false', 'short_answer',
    'listening', 'speaking', 'writing'
  )),
  prompt TEXT NOT NULL,
  options JSONB,
  answer JSONB NOT NULL,
  answer_text TEXT NOT NULL,
  audio_script TEXT,
  difficulty_tier SMALLINT NOT NULL DEFAULT 1,
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT questions_bank_unit_position_key UNIQUE (bank_id, unit_no, position)
);

CREATE INDEX IF NOT EXISTS questions_bank_unit_section_idx
  ON questions (bank_id, unit_no, section, position);

INSERT INTO question_banks (
  id, title, subject, grade, term, curriculum_version, source_url, source_appendices, updated_at
) VALUES (
  {sql_text(BANK_ID)}, {sql_text(BANK_TITLE)}, 'English', 3, 'first_term', 'PEP 2024',
  {sql_text(SOURCE_URL)}, {sql_json(["Words in each unit", "Vocabulary", "Useful expressions"])}, NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  subject = EXCLUDED.subject,
  grade = EXCLUDED.grade,
  term = EXCLUDED.term,
  curriculum_version = EXCLUDED.curriculum_version,
  source_url = EXCLUDED.source_url,
  source_appendices = EXCLUDED.source_appendices,
  updated_at = NOW();

INSERT INTO questions (
  id, bank_id, unit_no, unit_title, section, position, question_type, prompt,
  options, answer, answer_text, audio_script, difficulty_tier, tags, updated_at
) VALUES
{values}
ON CONFLICT (id) DO UPDATE SET
  bank_id = EXCLUDED.bank_id,
  unit_no = EXCLUDED.unit_no,
  unit_title = EXCLUDED.unit_title,
  section = EXCLUDED.section,
  position = EXCLUDED.position,
  question_type = EXCLUDED.question_type,
  prompt = EXCLUDED.prompt,
  options = EXCLUDED.options,
  answer = EXCLUDED.answer,
  answer_text = EXCLUDED.answer_text,
  audio_script = EXCLUDED.audio_script,
  difficulty_tier = EXCLUDED.difficulty_tier,
  tags = EXCLUDED.tags,
  updated_at = NOW();

COMMIT;
"""


def main() -> None:
    records = build_records()
    assert len(records) == 150, f"Expected 150 questions, got {len(records)}"
    OUT.write_text(build_sql(records), encoding="utf-8")
    print(f"Wrote {len(records)} questions to {OUT}")


if __name__ == "__main__":
    main()
