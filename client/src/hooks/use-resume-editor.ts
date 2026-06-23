import { useCallback, useRef, useState } from "react";
import type { ResumeJson } from "@shared/resume-utils";
import { resumeJsonToMarkdown, setByPath } from "@shared/resume-utils";

const MAX_UNDO = 50;

export function useResumeEditor(initialData: ResumeJson) {
  const [resumeData, setResumeData] = useState<ResumeJson>(() => structuredClone(initialData));
  const undoStack = useRef<ResumeJson[]>([]);
  const redoStack = useRef<ResumeJson[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const syncFlags = useCallback(() => {
    setCanUndo(undoStack.current.length > 0);
    setCanRedo(redoStack.current.length > 0);
  }, []);

  const pushUndo = useCallback(
    (snapshot: ResumeJson) => {
      undoStack.current.push(structuredClone(snapshot));
      if (undoStack.current.length > MAX_UNDO) undoStack.current.shift();
      redoStack.current = [];
      syncFlags();
    },
    [syncFlags]
  );

  const replaceData = useCallback(
    (next: ResumeJson, recordUndo = true) => {
      if (recordUndo) {
        pushUndo(resumeData);
      }
      setResumeData(structuredClone(next));
    },
    [pushUndo, resumeData]
  );

  const updateField = useCallback(
    (path: string, value: string) => {
      pushUndo(resumeData);
      setResumeData((prev) => {
        let parsed: unknown = value;
        if (/^skills\[\d+\]\.items$/.test(path)) {
          parsed = value.split(",").map((s) => s.trim()).filter(Boolean);
        }
        return setByPath(prev, path, parsed);
      });
    },
    [pushUndo, resumeData]
  );

  const applySectionEdit = useCallback(
    (section: string, value: string, recordUndo = false) => {
      if (recordUndo) pushUndo(resumeData);
      setResumeData((prev) => {
        let parsed: unknown = value;
        if (/^skills\[\d+\]\.items$/.test(section)) {
          parsed = value.split(",").map((s) => s.trim()).filter(Boolean);
        }
        return setByPath(prev, section, parsed);
      });
    },
    [pushUndo, resumeData]
  );

  const undo = useCallback(() => {
    const prev = undoStack.current.pop();
    if (!prev) return;
    redoStack.current.push(structuredClone(resumeData));
    setResumeData(prev);
    syncFlags();
  }, [resumeData, syncFlags]);

  const redo = useCallback(() => {
    const next = redoStack.current.pop();
    if (!next) return;
    undoStack.current.push(structuredClone(resumeData));
    setResumeData(next);
    syncFlags();
  }, [resumeData, syncFlags]);

  const resetFromServer = useCallback((data: ResumeJson) => {
    undoStack.current = [];
    redoStack.current = [];
    setResumeData(structuredClone(data));
    syncFlags();
  }, [syncFlags]);

  const toMarkdown = useCallback(() => resumeJsonToMarkdown(resumeData), [resumeData]);

  return {
    resumeData,
    replaceData,
    updateField,
    applySectionEdit,
    pushUndo,
    undo,
    redo,
    canUndo,
    canRedo,
    resetFromServer,
    toMarkdown,
  };
}

export type ResumeEditor = ReturnType<typeof useResumeEditor>;
