export class Track {
  idx: number;
  id: string;
  title: string;
  rating: number;
  danceability: number;
  energy: number;
  key: number;
  loudness: number;
  mode: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  valence: number;
  tempo: number;
  /**
   * Duration of the track in ms.
   */
  duration: number;
  timeSignature: number;
  numBars: number;
  numSections: number;
  numSegments: number;
  class: number;

  constructor({
    idx,
    id,
    title,
    rating,
    danceability,
    energy,
    key,
    loudness,
    mode,
    acousticness,
    instrumentalness,
    liveness,
    valence,
    tempo,
    duration,
    timeSignature,
    numBars,
    numSections,
    numSegments,
    class: trackClass,
  }: Track) {
    this.idx = idx;
    this.id = id;
    this.title = title;
    this.rating = rating;
    this.danceability = danceability;
    this.energy = energy;
    this.key = key;
    this.loudness = loudness;
    this.mode = mode;
    this.acousticness = acousticness;
    this.instrumentalness = instrumentalness;
    this.liveness = liveness;
    this.valence = valence;
    this.tempo = tempo;
    this.duration = duration;
    this.timeSignature = timeSignature;
    this.numBars = numBars;
    this.numSections = numSections;
    this.numSegments = numSegments;
    this.class = trackClass;
  }
}
