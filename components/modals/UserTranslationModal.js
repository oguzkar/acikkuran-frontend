import { useTranslation } from "next-i18next";
import { useRecoilValue } from "recoil";

import { modalState } from "@recoil/atoms";
import UserTranslationEditor from "@components/UserTranslation/UserTranslationEditor";

import BaseModal from "./BaseModal";

const UserTranslationModal = (props) => {
  const { modalKey } = props;
  const { t } = useTranslation("common");
  const modalInfo = useRecoilValue(modalState);
  const MODAL_WIDTH = 600;

  const { verseId, onSaved, initialTranslation } =
    modalInfo?.modalProps || {};

  return (
    <BaseModal
      modalKey={modalKey}
      width={MODAL_WIDTH}
      title={t("user_translation__title")}
    >
      <UserTranslationEditor
        verseId={verseId}
        onSaved={onSaved}
        initialTranslation={initialTranslation}
      />
    </BaseModal>
  );
};

export default UserTranslationModal;
