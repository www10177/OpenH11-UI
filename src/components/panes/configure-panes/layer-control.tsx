import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'src/store/hooks';
import {
  getNumberOfLayers,
  getSelectedLayerIndex,
  setLayer,
} from 'src/store/keymapSlice';
import { getSelectedConnectedDevice } from 'src/store/devicesSlice';
import { getLayerNames, updateLayerName } from 'src/store/settingsSlice';
import styled from 'styled-components';
import React from 'react';
import { useTranslation } from 'react-i18next';

const Container = styled.div`
  position: absolute;
  left: 15px;
  font-weight: 400;
  top: 10px;
`;
const Label = styled.label`
  font-size: 20px;
  text-transform: uppercase;
  color: var(--color_label-highlighted);
  margin-right: 6px;
`;
const LayerButton = styled.button<{ $selected?: boolean }>`
  outline: none;
  font-variant-numeric: tabular-nums;
  border: none;
  background: ${(props) =>
    props.$selected ? 'var(--color_accent)' : 'transparent'};
  color: ${(props) =>
    props.$selected
      ? 'var(--color_inside-accent)'
      : 'var(--color_label-highlighted)'};
  cursor: pointer;
  font-size: 20px;
  font-weight: 400;
  &:hover {
    border: none;
    background: ${(props) => (props.$selected ? 'auto' : 'var(--bg_menu)')};
    color: ${(props) =>
    props.$selected ? 'auto' : 'var(--color_label-highlighted)'};
  }
`;

const LayerNameInput = styled.input`
  font-size: 20px;
  background: transparent;
  border: none;
  font-family: inherit;
  color: var(--color_label-highlighted);
  border-bottom: 1px dashed var(--color_accent);
  margin-left: 15px;
  outline: none;
  font-weight: bold;
  &::placeholder {
    color: var(--color_label);
    font-weight: normal;
  }
`;

export const LayerControl: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const numberOfLayers = useAppSelector(getNumberOfLayers);
  const selectedLayerIndex = useAppSelector(getSelectedLayerIndex);

  // Custom layer names state
  const device = useAppSelector(getSelectedConnectedDevice);
  const layerNames = useAppSelector(getLayerNames);
  const currentLayerName = device ? layerNames[device.path]?.[selectedLayerIndex] || '' : '';

  const [editingName, setEditingName] = React.useState(currentLayerName);

  React.useEffect(() => {
    setEditingName(currentLayerName);
  }, [currentLayerName, selectedLayerIndex]);

  const handleNameSave = () => {
    if (device) {
      dispatch(updateLayerName({
        devicePath: device.path,
        layer: selectedLayerIndex,
        name: editingName
      }));
    }
  };

  const Layers = useMemo(
    () =>
      new Array(numberOfLayers)
        .fill(0)
        .map((_, idx) => idx)
        .map((layerLabel) => (
          <LayerButton
            key={layerLabel}
            $selected={layerLabel === selectedLayerIndex}
            onClick={() => dispatch(setLayer(layerLabel))}
          >
            {layerLabel}
          </LayerButton>
        )),
    [numberOfLayers, selectedLayerIndex],
  );

  return (
    <Container>
      <Label>{t('Layer')}</Label>
      {children}
      {Layers}
      {device && (
        <LayerNameInput
          value={editingName}
          onChange={e => setEditingName(e.target.value)}
          onBlur={handleNameSave}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.currentTarget.blur();
            }
          }}
          placeholder={t('Name your layer...')}
          maxLength={16}
        />
      )}
    </Container>
  );
};
