import { Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AppShell } from './AppShell';
import { useThemeEffect } from '@/state/StoreProvider';
import { HomeScreen } from '@/features/home/HomeScreen';
import { FlowSelectorScreen } from '@/features/home/FlowSelectorScreen';
import { SessionScreen } from '@/features/session/SessionScreen';
import {
  InterviewCollectionScreen,
  InterviewHubScreen,
  PromptDetailScreen,
  StarDetailScreen,
} from '@/features/interview/InterviewScreens';
import { LessonDetailScreen, PenalHubScreen } from '@/features/penal/PenalScreens';
import {
  FlashcardsScreen,
  PracticeHubScreen,
  QuestionDetailScreen,
} from '@/features/practice/PracticeScreens';
import { ObjectiveDetailScreen, RouteScreen } from '@/features/route/RouteScreens';
import {
  CaseDetailScreen,
  CasesScreen,
  ErrorsScreen,
  ExitReviewScreen,
  MockScreen,
  MoreScreen,
  NotFoundScreen,
  PreferencesScreen,
  ProgressScreen,
  ReferenceScreen,
} from '@/features/misc/MiscScreens';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: 'auto' });
    } catch {
      // Entornos sin scroll real (pruebas, webviews antiguos): no es esencial.
    }
  }, [pathname]);
  return null;
}

export function App() {
  useThemeEffect();
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* La sesión usa un shell reducido: menos chrome, pero conserva salir y progreso. */}
        <Route path="/sesion" element={<SessionScreen />} />
        <Route
          path="*"
          element={
            <AppShell>
              <Routes>
                <Route path="/" element={<HomeScreen />} />
                <Route path="/estudiar" element={<FlowSelectorScreen mode="study" />} />
                <Route path="/practicar" element={<FlowSelectorScreen mode="practice" />} />
                <Route path="/ruta" element={<RouteScreen />} />
                <Route path="/ruta/:objectiveId" element={<ObjectiveDetailScreen />} />
                <Route path="/entrevista" element={<InterviewHubScreen />} />
                <Route
                  path="/entrevista/top10"
                  element={<InterviewCollectionScreen collection="top10" />}
                />
                <Route
                  path="/entrevista/dificiles"
                  element={<InterviewCollectionScreen collection="dificiles" />}
                />
                <Route path="/entrevista/prompt/:promptId" element={<PromptDetailScreen />} />
                <Route path="/entrevista/star/:starId" element={<StarDetailScreen />} />
                <Route path="/penal" element={<PenalHubScreen />} />
                <Route path="/penal/leccion/:lessonId" element={<LessonDetailScreen />} />
                <Route path="/practica" element={<PracticeHubScreen />} />
                <Route path="/practica/pregunta/:questionId" element={<QuestionDetailScreen />} />
                <Route path="/flashcards" element={<FlashcardsScreen />} />
                <Route path="/casos" element={<CasesScreen />} />
                <Route path="/casos/:caseId" element={<CaseDetailScreen />} />
                <Route path="/simulacro" element={<MockScreen />} />
                <Route path="/errores" element={<ErrorsScreen />} />
                <Route path="/progreso" element={<ProgressScreen />} />
                <Route path="/repaso-final" element={<ExitReviewScreen />} />
                <Route path="/referencia" element={<ReferenceScreen />} />
                <Route path="/preferencias" element={<PreferencesScreen />} />
                <Route path="/mas" element={<MoreScreen />} />
                <Route path="*" element={<NotFoundScreen />} />
              </Routes>
            </AppShell>
          }
        />
      </Routes>
    </>
  );
}
