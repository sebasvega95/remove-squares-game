import * as React from "react";
import styled from "styled-components";
import { darken } from "polished";

interface Props {
  numItemsPerGroup: number[];
}

interface State {
  currentPlayer: number;
  selectedGroup: number | null;
  itemsRemovedPerGroup: boolean[][];
}

enum ActionType {
  remove,
  passTurn,
  restart,
}

interface RemoveAction {
  type: ActionType.remove;
  payload: {
    group: number;
    item: number;
  };
}

interface PassTurnAction {
  type: ActionType.passTurn;
}

interface RestartAction {
  type: ActionType.restart;
  payload: {
    numItemsPerGroup: number[];
  };
}

type Action = RemoveAction | PassTurnAction | RestartAction;

function checkGameOver(items: boolean[][]): boolean {
  let numNotRemoved = items
    .flat()
    .reduce((count, isRemoved) => count + Number(!isRemoved), 0);
  return numNotRemoved <= 1;
}

function init(numItemsPerGroup: number[]): State {
  return {
    currentPlayer: 0,
    selectedGroup: null,
    itemsRemovedPerGroup: numItemsPerGroup.map((numItems) =>
      Array<boolean>(numItems).fill(false)
    ),
  };
}

function reducer(state: State, action: Action): State {
  if (action.type === ActionType.remove) {
    let toRemove = action.payload;
    let currentGroup = state.selectedGroup ?? toRemove.group;
    if (toRemove.group !== currentGroup) {
      return state;
    }
    let itemsRemovedPerGroup = [...state.itemsRemovedPerGroup];
    itemsRemovedPerGroup[toRemove.group][toRemove.item] = true;
    return {
      ...state,
      selectedGroup: currentGroup,
      itemsRemovedPerGroup,
    };
  }
  if (action.type === ActionType.passTurn) {
    return {
      ...state,
      currentPlayer: 1 - state.currentPlayer,
      selectedGroup: null,
    };
  }
  if (action.type === ActionType.restart) {
    return init(action.payload.numItemsPerGroup);
  }
  return state;
}

const groupColors = ["LightPink", "LightSkyBlue", "#fc8d62"];
const playerColors = ["DarkSlateBlue", "DarkRed"];

export default function Game({ numItemsPerGroup }: Props) {
  const [state, dispatch] = React.useReducer(reducer, numItemsPerGroup, init);

  let gameOver = checkGameOver(state.itemsRemovedPerGroup);
  return (
    <>
      <div>
        <h2
          style={{
            color: gameOver
              ? playerColors[1 - state.currentPlayer]
              : playerColors[state.currentPlayer],
            fontWeight: "bold",
          }}
        >
          {gameOver
            ? `Juego terminado! Jugador ${2 - state.currentPlayer} gana!`
            : `Turno del jugador ${state.currentPlayer + 1}`}
        </h2>
      </div>
      <GameContainer>
        {state.itemsRemovedPerGroup.map((items, group) => (
          <Group key={`group-${group}`}>
            {items.map((isRemoved, item) => (
              <Item
                color={groupColors[group]}
                key={`item-${item}`}
                disabled={gameOver || isRemoved}
                removed={isRemoved}
                canRemove={
                  !gameOver &&
                  (state.selectedGroup !== null
                    ? group === state.selectedGroup
                    : true)
                }
                onClick={() =>
                  dispatch({
                    type: ActionType.remove,
                    payload: { group, item },
                  })
                }
              />
            ))}
          </Group>
        ))}
      </GameContainer>
      <div>
        <Button
          disabled={gameOver || state.selectedGroup === null}
          onClick={() => dispatch({ type: ActionType.passTurn })}
          primary
        >
          Terminar turno
        </Button>
        <Button
          onClick={() =>
            dispatch({
              type: ActionType.restart,
              payload: { numItemsPerGroup },
            })
          }
          primary={gameOver}
        >
          Reiniciar
        </Button>
      </div>
    </>
  );
}

interface ButtonProps {
  disabled?: boolean;
  primary: boolean;
}
const Button = styled.button`
  ${(props: ButtonProps) =>
    !props.disabled && {
      background: props.primary ? "palevioletred" : "white",
      color: props.primary ? "white" : "palevioletred",
      borderColor: "palevioletred",
    }}
  cursor: ${(props: ButtonProps) =>
    props.disabled ? "not-allowed" : "pointer"};
  font-size: 1em;
  margin: 1em;
  padding: 0.25em 1em;
  border-width: 2px;
  border-style: solid;
  border-radius: 3px;
`;

const GameContainer = styled.div`
  display: flex;
  min-height: 300px;
  align-self: stretch;
  flex-flow: row wrap;
  justify-content: center;
  margin: 2em;
`;

const Group = styled.div`
  display: flex;
  max-height: 10em;
  padding: 5em 2em;
  justify-content: center;
  align-items: stretch;
  flex-flow: row wrap;

  & + & {
    border-left: 2px solid palevioletred;
  }
`;

interface ItemProps {
  color: string;
  removed: boolean;
  canRemove: boolean;
}
const Item = styled.button`
  height: 5em;
  width: 5em;
  background-color: ${({ removed, color }: ItemProps) =>
    removed ? "white" : color};
  border: 3px dotted
    ${({ removed, color }: ItemProps) =>
      removed ? "white" : darken(0.4, color)};
  cursor: ${({ removed, canRemove }: ItemProps) =>
    removed ? "auto" : canRemove ? "pointer" : "not-allowed"};

  &:nth-child(odd) {
    align-self: flex-end;
  }

  &:nth-child(even) {
    align-self: flex-start;
  }
`;
