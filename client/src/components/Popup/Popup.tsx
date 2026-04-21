import "./Popup.css"

type PopupProps = {
  message: string
  active: boolean
}

export function Popup({ message, active }: PopupProps) {
  return (
    <>
      <div className={`popup ${active ? "active" : ""}`} data-testid="popup">
        <p>{message}</p>
      </div>
    </>
  )
}
