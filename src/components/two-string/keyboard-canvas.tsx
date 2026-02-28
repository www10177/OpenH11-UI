import React, { useMemo } from 'react';
import { shallowEqual } from 'react-redux';
import {
  calculateKeyboardFrameDimensions,
  CSSVarObject,
} from 'src/utils/keyboard-rendering';
import styled from 'styled-components';
import {
  KeyboardCanvasProps,
  KeyboardCanvasContentProps,
} from 'src/types/keyboard-rendering';
import { Case } from './case';
import { KeyGroup } from './key-group';
import { MatrixLines } from './matrix-lines';
import { useAppSelector } from 'src/store/hooks';
import { getSelectedLayerIndex } from 'src/store/keymapSlice';
import { getLayerNames } from 'src/store/settingsSlice';
import { getSelectedConnectedDevice } from 'src/store/devicesSlice';
export const KeyboardCanvas: React.FC<KeyboardCanvasProps<React.MouseEvent>> = (
  props,
) => {
  const { containerDimensions, shouldHide, ...otherProps } = props;
  const { width, height } = useMemo(
    () => calculateKeyboardFrameDimensions(otherProps.keys),
    [otherProps.keys],
  );
  const containerHeight = containerDimensions.height;
  const minPadding = 35;
  const ratio =
    Math.min(
      Math.min(
        1,
        containerDimensions &&
        containerDimensions.width /
        ((CSSVarObject.keyWidth + CSSVarObject.keyXSpacing) * width -
          CSSVarObject.keyXSpacing +
          minPadding * 2),
      ),
      containerHeight /
      ((CSSVarObject.keyHeight + CSSVarObject.keyYSpacing) * height -
        CSSVarObject.keyYSpacing +
        minPadding * 2),
    ) || 1;

  return (
    <div
      style={{
        transform: `scale(${ratio}, ${ratio})`,
        opacity: shouldHide ? 0 : 1,
        position: 'absolute',
        pointerEvents: shouldHide ? 'none' : 'all',
      }}
    >
      <KeyboardCanvasContent {...otherProps} width={width} height={height} />
    </div>
  );
};
const KeyboardGroup = styled.div`
  position: relative;
`;

const LayerTextHUD = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
  pointer-events: none;
`;

const LayerBadge = styled.span`
  background: var(--color_accent);
  color: var(--color_inside-accent);
  font-size: 28px;
  font-weight: 900;
  padding: 4px 18px;
  border-radius: 8px;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
`;

const LayerName = styled.span`
  color: #fff;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-shadow: 0 0 12px var(--color_accent), 0 0 4px rgba(255,255,255,0.5);
`;

const KeyboardCanvasContent: React.FC<
  KeyboardCanvasContentProps<React.MouseEvent>
> = React.memo((props) => {
  const {
    matrixKeycodes,
    keys,
    definition,
    pressedKeys,
    mode,
    showMatrix,
    selectable,
    width,
    height,
  } = props;

  const selectedLayerIndex = useAppSelector(getSelectedLayerIndex);
  const device = useAppSelector(getSelectedConnectedDevice);
  const layerNames = useAppSelector(getLayerNames);
  const vpidStr = device && typeof device !== 'string' ? device.vendorProductId.toString() : undefined;
  const customName = vpidStr ? layerNames[vpidStr]?.[selectedLayerIndex] : '';

  return (
    <KeyboardGroup>
      <Case width={width} height={height} />
      <KeyGroup
        {...props}
        keys={keys}
        mode={mode}
        matrixKeycodes={matrixKeycodes}
        selectable={selectable}
        definition={definition}
        pressedKeys={pressedKeys}
      />
      {showMatrix && (
        <MatrixLines
          keys={keys}
          rows={definition.matrix.rows}
          cols={definition.matrix.cols}
          width={width}
          height={height}
        />
      )}
      <LayerTextHUD>
        <LayerBadge>Layer {selectedLayerIndex}</LayerBadge>
        {customName && <LayerName>{customName}</LayerName>}
      </LayerTextHUD>
    </KeyboardGroup>
  );
}, shallowEqual);
