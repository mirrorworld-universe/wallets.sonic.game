export type SonicGreeter = {
  version: "0.1.0";
  name: "hello_sonic_world";
  instructions: [
    {
      name: "initialize";
      accounts: [
        { name: "greetingAccount"; isMut: true; isSigner: false },
        { name: "user"; isMut: true; isSigner: true },
        { name: "systemProgram"; isMut: false; isSigner: false }
      ];
      args: [{ name: "authority"; type: "publicKey" }];
    },
    {
      name: "incrementGreeting";
      accounts: [
        { name: "greetingAccount"; isMut: true; isSigner: false },
        { name: "user"; isMut: false; isSigner: true }
      ];
      args: [{ name: "greetingAccountBump"; type: "u8" }];
    }
  ];
  accounts: [
    {
      name: "greetingAccount";
      type: {
        kind: "struct";
        fields: [
          { name: "counter"; type: "u32" },
          { name: "authority"; type: "publicKey" }
        ];
      };
    }
  ];
};
export const IDL: SonicGreeter = {
  version: "0.1.0",
  name: "hello_sonic_world",
  instructions: [
    {
      name: "initialize",
      accounts: [
        { name: "greetingAccount", isMut: true, isSigner: false },
        { name: "user", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [{ name: "authority", type: "publicKey" }],
    },
    {
      name: "incrementGreeting",
      accounts: [
        { name: "greetingAccount", isMut: true, isSigner: false },
        { name: "user", isMut: false, isSigner: true },
      ],
      args: [{ name: "greetingAccountBump", type: "u8" }],
    },
  ],
  accounts: [
    {
      name: "greetingAccount",
      type: {
        kind: "struct",
        fields: [
          { name: "counter", type: "u32" },
          { name: "authority", type: "publicKey" },
        ],
      },
    },
  ],
};
