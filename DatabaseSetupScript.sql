create table "user"
(
    id         uuid      not null
        constraint user_pk
            primary key,
    username   char(20)  not null,
    first_name char(40)  not null,
    last_name  char(40)  not null,
    email      char(320) not null,
    password   char(72)  not null
);

create unique index user_id_uindex
    on "user" (id);

create unique index user_username_uindex
    on "user" (username);

create table team_details
(
    id           uuid     not null,
    team_name    char(40) not null,
    team_manager uuid
        constraint team_details_user_id_fk
            references "user"
);

create unique index team_details_id_uindex
    on team_details (id);

create unique index team_details_team_name_uindex
    on team_details (team_name);

create table teams
(
    user_id uuid
        constraint teams_user_id_fk
            references "user",
    team_id uuid
        constraint teams_team_details_id_fk
            references team_details (id)
);

create table tasks
(
    id            uuid      not null,
    name          char(240) not null,
    desrciption   text,
    date_created  date      not null,
    date_due      date,
    done          boolean,
    assignee      uuid
        constraint table_name_user_id_fk
            references "user",
    team          uuid
        constraint table_name_team_details_id_fk
            references team_details (id),
    date_finished date
);

create unique index table_name_id_uindex
    on tasks (id);


