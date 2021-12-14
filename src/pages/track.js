import React, { useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { Layout, QueryResult } from '../components';
import TrackDetail from '../components/track-detail';

/** GET_TRACK gql query to retrieve a specific track by its ID */
export const GET_TRACK = gql`
  query getTrack($trackId: ID!) {
    track(id: $trackId) {
      id
      title
      author {
        id
        name
        photo
      }
      thumbnail
      length
      modulesCount
      numberOfViews
      modules {
        id
        title
        length
      }
      description
    }
  }
`;

const TRACK_SUBSCRIPTION = gql`
  subscription OnTrackViewsUpdated($trackId: ID!) {
    trackViewsUpdated(id: $trackId) {
      id
      numberOfViews
    }
  }
`;

/**
 * Track Page fetches a track's data from the gql query GET_TRACK
 * and provides it to the TrackDetail component to display
 */
const Track = ({ trackId }) => {
  const { loading, error, data, subscribeToMore } = useQuery(GET_TRACK, {
    variables: { trackId },
  });

  useEffect(() => {
    console.log(`subscribing to ${trackId}...`);
    const unsubscribe = subscribeToMore({
      document: TRACK_SUBSCRIPTION,
      variables: { trackId },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        return {
          ...prev,
          track: {
            ...prev.track,
            numberOfViews:
              subscriptionData.data.trackViewsUpdated.numberOfViews,
          },
        };
      },
    });
    console.log(`subscribed to ${trackId}.`);

    return () => {
      console.log(`unsubscribing for ${trackId}...`);
      unsubscribe();
      console.log(`unsubscribed for ${trackId}.`);
    };
  }, [subscribeToMore, trackId]);

  return (
    <Layout>
      <QueryResult error={error} loading={loading} data={data}>
        <TrackDetail track={data?.track} />
      </QueryResult>
    </Layout>
  );
};

export default Track;
