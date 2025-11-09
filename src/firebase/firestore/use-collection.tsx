"use client";

import { useState, useEffect } from "react";
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  CollectionReference,
} from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { useUser } from "@/firebase";
import { logger } from "@/lib/logger";

/** Utility type to add an 'id' field to a given type T. */
export type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useCollection hook.
 * @template T Type of the document data.
 */
export interface UseCollectionResult<T> {
  data: WithId<T>[] | null; // Document data with ID, or null.
  isLoading: boolean; // True if loading.
  error: FirestoreError | Error | null; // Error object, or null.
}

/* Internal implementation of Query:
  https://github.com/firebase/firebase-js-sdk/blob/c5f08a9bc5da0d2b0207802c972d53724ccef055/packages/firestore/src/lite-api/reference.ts#L143
*/
export interface InternalQuery extends Query<DocumentData> {
  _query: {
    path: {
      canonicalString(): string;
      toString(): string;
    };
  };
}

/**
 * React hook to subscribe to a Firestore collection or query in real-time.
 * Handles nullable references/queries.
 *
 *
 * IMPORTANT! YOU MUST MEMOIZE the inputted memoizedTargetRefOrQuery or BAD THINGS WILL HAPPEN
 * use useMemo to memoize it per React guidence.  Also make sure that it's dependencies are stable
 * references
 *
 * @template T Optional type for document data. Defaults to any.
 * @param {CollectionReference<DocumentData> | Query<DocumentData> | null | undefined} targetRefOrQuery -
 * The Firestore CollectionReference or Query. Waits if null/undefined.
 * @returns {UseCollectionResult<T>} Object with data, isLoading, error.
 */
export function useCollection<T = any>(
  memoizedTargetRefOrQuery:
    | ((CollectionReference<DocumentData> | Query<DocumentData>) & {
        __memo?: boolean;
      })
    | null
    | undefined
): UseCollectionResult<T> {
  type ResultItemType = WithId<T>;
  type StateDataType = ResultItemType[] | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  // CRITICAL: Get user authentication state
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    // Wait for auth to finish loading
    if (isUserLoading) {
      logger.debug("[useCollection] Waiting for auth to load");
      setIsLoading(true);
      return;
    }

    // Don't make requests if not authenticated
    if (!user) {
      logger.debug("[useCollection] No authenticated user, skipping query");
      setData(null);
      setIsLoading(false);
      setError(new Error("Usuario no autenticado"));
      return;
    }

    if (!memoizedTargetRefOrQuery) {
      logger.debug("[useCollection] No query provided");
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    const path =
      memoizedTargetRefOrQuery.type === "collection"
        ? (memoizedTargetRefOrQuery as CollectionReference).path
        : (
            memoizedTargetRefOrQuery as unknown as InternalQuery
          )._query.path.canonicalString();

    logger.debug("[useCollection] Starting query", { path, uid: user.uid });
    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      memoizedTargetRefOrQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        logger.debug("[useCollection] Snapshot received", {
          path,
          count: snapshot.docs.length,
        });
        const results: ResultItemType[] = [];
        for (const doc of snapshot.docs) {
          results.push({ ...(doc.data() as T), id: doc.id });
        }
        setData(results);
        setError(null);
        setIsLoading(false);
      },
      (error: FirestoreError) => {
        logger.error("[useCollection] Firestore error", {
          path,
          error: error.message,
        });
        const contextualError = new FirestorePermissionError({
          operation: "list",
          path,
        });

        setError(contextualError);
        setData(null);
        setIsLoading(false);

        errorEmitter.emit("permission-error", contextualError);
      }
    );

    return () => unsubscribe();
  }, [memoizedTargetRefOrQuery, user, isUserLoading]);

  if (memoizedTargetRefOrQuery && !(memoizedTargetRefOrQuery as any).__memo) {
    const path =
      memoizedTargetRefOrQuery.type === "collection"
        ? (memoizedTargetRefOrQuery as CollectionReference).path
        : (
            memoizedTargetRefOrQuery as unknown as InternalQuery
          )._query.path.canonicalString();

    logger.warn(
      `useCollection was passed an unmemoized query for path: ${path}. This will cause infinite loops. Please wrap the query with useMemoFirebase.`
    );
  }

  return { data, isLoading, error };
}
