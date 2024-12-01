export const menu = [
  {
    id: "dashboard",
    displayName: "Dashboard",
    link: "/dashboard",
    children: [],
    open: false,
    img: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g id="Icons/home">
          <path
            id="Union"
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12.6424 4.23359L19.1424 9.68149C19.3691 9.87149 19.5 10.1521 19.5 10.4479V19.0856C19.5 19.6379 19.0523 20.0856 18.5 20.0856H5.5C4.94772 20.0856 4.5 19.6379 4.5 19.0856V10.4479C4.5 10.1521 4.63095 9.87149 4.85765 9.68149L11.3576 4.23359C11.7293 3.92214 12.2707 3.92214 12.6424 4.23359ZM10.0729 2.70078C11.1878 1.76641 12.8122 1.76641 13.9271 2.70078L20.4271 8.14867C21.1072 8.71868 21.5 9.56052 21.5 10.4479V19.0856C21.5 20.7425 20.1569 22.0856 18.5 22.0856H5.5C3.84315 22.0856 2.5 20.7425 2.5 19.0856V10.4479C2.5 9.56052 2.89285 8.71868 3.57294 8.14867L10.0729 2.70078ZM14 18.174C14.5523 18.174 15 17.7263 15 17.174C15 16.6217 14.5523 16.174 14 16.174H10C9.44772 16.174 9 16.6217 9 17.174C9 17.7263 9.44772 18.174 10 18.174H14Z"
            fill="#313131"
          />
        </g>
      </svg>
    ),
  },
  {
    id: "projects",
    displayName: "Projects",
    open: false,
    children: [
      {
        id: "create-project",
        displayName: "Create a New Project",
        link: "/projects/create",
      },
      {
        id: "projects-list",
        displayName: "Projects List",
        link: "/projects",
      },
    ],
    img: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g id="Icon/Outline/collection">
          <path
            id="Icon"
            d="M19 11H5M19 11C20.1046 11 21 11.8954 21 13V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V13C3 11.8954 3.89543 11 5 11M19 11V9C19 7.89543 18.1046 7 17 7M5 11V9C5 7.89543 5.89543 7 7 7M7 7V5C7 3.89543 7.89543 3 9 3H15C16.1046 3 17 3.89543 17 5V7M7 7H17"
            stroke="#313131"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    ),
  },
  {
    id: "quote",
    displayName: "Quote",
    open: false,
    children: [
      {
        id: "quotes-list",
        displayName: "Quotes List",
        link: "/quotes",
      },
    ],
    img: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g id="Icons/Notification">
          <path
            id="Union"
            fillRule="evenodd"
            clipRule="evenodd"
            d="M6.5 4H17.5C18.0523 4 18.5 4.44772 18.5 5V19C18.5 19.5523 18.0523 20 17.5 20H6.5C5.94772 20 5.5 19.5523 5.5 19V5C5.5 4.44772 5.94771 4 6.5 4ZM3.5 5C3.5 3.34315 4.84315 2 6.5 2H17.5C19.1569 2 20.5 3.34315 20.5 5V19C20.5 20.6569 19.1569 22 17.5 22H6.5C4.84315 22 3.5 20.6569 3.5 19V5ZM8.5 7C7.94772 7 7.5 7.44772 7.5 8C7.5 8.55228 7.94772 9 8.5 9H15.5C16.0523 9 16.5 8.55228 16.5 8C16.5 7.44772 16.0523 7 15.5 7H8.5ZM7.5 12C7.5 11.4477 7.94772 11 8.5 11H15.5C16.0523 11 16.5 11.4477 16.5 12C16.5 12.5523 16.0523 13 15.5 13H8.5C7.94772 13 7.5 12.5523 7.5 12ZM8.5 15C7.94772 15 7.5 15.4477 7.5 16C7.5 16.5523 7.94772 17 8.5 17H11.5C12.0523 17 12.5 16.5523 12.5 16C12.5 15.4477 12.0523 15 11.5 15H8.5Z"
            fill="#313131"
          />
        </g>
      </svg>
    ),
  },
  {
    id: "administration",
    displayName: "Administration",
    open: false,
    children: [
      {
        id: "user",
        displayName: "User",
        link: "/admin/user",
      },
      {
        id: "account",
        displayName: "Change password",
        link: "/account/changePassword",
      },
      {
        id: "tables",
        displayName: "Tables",
        link: "/admin/tables",
      },
      {
        id: "notes",
        displayName: "Notes",
        link: "/admin/notes",
      },
      {
        id: "logs",
        displayName: "Logs",
        link: "/admin/logs",
      },
    ],
    img: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g id="profile">
          <path
            id="Union"
            fillRule="evenodd"
            clipRule="evenodd"
            d="M7.08004 18.3087C8.43704 19.3685 10.1448 20 12 20C13.8552 20 15.563 19.3685 16.92 18.3087C16.6078 16.9851 15.4189 16 14 16H10C8.58106 16 7.39221 16.9851 7.08004 18.3087ZM5.54529 16.7271C4.57377 15.4027 4 13.7684 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 13.7684 19.4262 15.4027 18.4547 16.7271C17.6271 15.1082 15.943 14 14 14H10C8.05704 14 6.37292 15.1082 5.54529 16.7271ZM12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM10.5 9.5C10.5 10.3284 11.1716 11 12 11C12.8284 11 13.5 10.3284 13.5 9.5C13.5 8.67157 12.8284 8 12 8C11.1716 8 10.5 8.67157 10.5 9.5ZM12 6C10.067 6 8.5 7.567 8.5 9.5C8.5 11.433 10.067 13 12 13C13.933 13 15.5 11.433 15.5 9.5C15.5 7.567 13.933 6 12 6Z"
            fill="#313131"
          />
        </g>
      </svg>
    ),
  },
];
