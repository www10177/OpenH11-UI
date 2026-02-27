import React, { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { ConfigureBasePane } from './pane';
import { ConfigureFlexCell, Grid, SpanOverflowCell } from './grid';
import { LayerControl } from './configure-panes/layer-control';
import { Badge } from './configure-panes/badge';
import { clearSelectedKey, setConfigureKeyboardIsSelectable, setLayer, getLoadProgress } from 'src/store/keymapSlice';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { getSelectedDefinition } from 'src/store/definitionsSlice';
import { Loader, ConfigurePanels } from './configure';
import { mapEvtToKeycode } from 'src/utils/key-event';
import { getBasicKeyToByte, getSelectedKeyDefinitions } from 'src/store/definitionsSlice';
import { getConnectedDevices, getSupportedIds } from 'src/store/devicesSlice';
import { getByteForCode, keycodeInMaster } from 'src/utils/key';
import { getSelectedKey, updateKey as updateKeyAction, updateSelectedKey } from 'src/store/keymapSlice';
import { getNextKey } from 'src/utils/keyboard-rendering';
import { getDisableFastRemap, getRenderMode } from 'src/store/settingsSlice';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Container = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 24px;
`;

const Title = styled.h1`
  color: var(--color_accent);
  margin-bottom: 24px;
`;

export const OpenH11Pane: FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const selectedDefinition = useAppSelector(getSelectedDefinition);
  const { basicKeyToByte } = useAppSelector(getBasicKeyToByte);
  const disableFastRemap = useAppSelector(getDisableFastRemap);
  const selectedKeyDefinitions = useAppSelector(getSelectedKeyDefinitions);
  const renderMode = useAppSelector(getRenderMode);
  const connectedDevices = useAppSelector(getConnectedDevices);
  const supportedIds = useAppSelector(getSupportedIds);
  const loadProgress = useAppSelector(getLoadProgress);
  const selectedKey = useAppSelector(getSelectedKey);
  const [isSyncing, setIsSyncing] = React.useState(true);

  const hasNoConnectedDevices = !Object.values(connectedDevices).length;
  const hasNoSupportedIds = !Object.values(supportedIds).length;

  React.useEffect(() => {
    dispatch(setConfigureKeyboardIsSelectable(true));

    // Auto-switch layer based on hardware poll
    const handler = (e: any) => {
      if (isSyncing) {
        dispatch(setLayer(e.detail));
      }
    };
    window.addEventListener('via-layer-update', handler);
    return () => {
      window.removeEventListener('via-layer-update', handler);
      dispatch(setConfigureKeyboardIsSelectable(false));
    };
  }, [dispatch, isSyncing]);

  // Keyboard capture configuration
  React.useEffect(() => {
    if (selectedKey === null || selectedKey === undefined) return;
    const keydownHandler = (evt: KeyboardEvent) => {
      evt.preventDefault();
      const code = mapEvtToKeycode(evt);
      if (code && keycodeInMaster(code, basicKeyToByte)) {
        const byte = getByteForCode(code, basicKeyToByte);
        dispatch(updateKeyAction(selectedKey, byte));
        dispatch(
          updateSelectedKey(
            disableFastRemap || !selectedKeyDefinitions
              ? null
              : getNextKey(selectedKey, selectedKeyDefinitions)
          )
        );
      }
    };
    window.addEventListener('keydown', keydownHandler);
    return () => window.removeEventListener('keydown', keydownHandler);
  }, [selectedKey, basicKeyToByte, disableFastRemap, selectedKeyDefinitions, dispatch]);

  const showLoader = !selectedDefinition || loadProgress !== 1;
  return showLoader ? (
    renderMode === '2D' ? (
      <Loader
        selectedDefinition={selectedDefinition || null}
        loadProgress={loadProgress}
      />
    ) : null
  ) : (
    <ConfigureBasePane>
      <ConfigureFlexCell
        onClick={(evt) => {
          if ((evt.target as any).nodeName !== 'CANVAS') {
            dispatch(clearSelectedKey());
          }
        }}
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          top: 50,
          left: 0,
          right: 0,
        }}
      >
        <div style={{ pointerEvents: 'all' }}>
          <LayerControl>
            <span
              style={{ cursor: 'pointer', fontSize: 18, color: isSyncing ? 'var(--color_accent)' : 'var(--color_label)', marginRight: 15, position: 'relative', top: 2 }}
              onClick={() => setIsSyncing(!isSyncing)}
              title="Sync Layer"
            >
              <FontAwesomeIcon icon={faSync} />
            </span>
          </LayerControl>
          <Badge />
        </div>
      </ConfigureFlexCell>

      <ConfigurePanels />
    </ConfigureBasePane>
  );
};
