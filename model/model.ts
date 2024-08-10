export interface MovieGetResponse {
    movieId:  number;
    title:    string;
    year:     number;
    genre:    string;
    director: string;
    plot:     string;
    poster:   string;
    rating:   number;
}

export interface PeopleGetResponse {
    personId:  number;
    name:      string;
    birthdate: string;
    biography: string;
}
export interface CreatorsGetResponse {
    movieId:  number;
    personId: number;
    role:     string;
}
export interface StarsGetResponse {
    starId:   number;
    movieId:  number;
    personId: number;
    role:     string;
}
