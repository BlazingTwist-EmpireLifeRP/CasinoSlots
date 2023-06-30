-- This resource was made by plesalex100#7387
-- Please respect it, don't repost it without my permission
-- This Resource started from: https://codepen.io/AdrianSandu/pen/MyBQYz
-- ESX Version: saNhje & wUNDER


ESX                             = nil
local PlayerData                = {}
local open 						= false

Citizen.CreateThread(function()
    while ESX == nil do
        Citizen.Wait(10)

        TriggerEvent("esx:getSharedObject", function(xPlayer)
            ESX = xPlayer
        end)
    end

    while not ESX.IsPlayerLoaded() do 
        Citizen.Wait(500)
    end

    if ESX.IsPlayerLoaded() then
        PlayerData = ESX.GetPlayerData()
        CreateBlip()
    end
end)

-------------------------------------------------------------------------------
-- FUNCTIONS
-------------------------------------------------------------------------------
local function drawHint(text)
	SetTextComponentFormat("STRING")
	AddTextComponentString(text)
	DisplayHelpTextFromStringLabel(0, 0, 1, -1)
end

function CreateBlip()
	if Config.blipsEnabled then
		for k,v in ipairs(Config.Slots)do
			local blip = AddBlipForCoord(v.x, v.y, v.z)
			SetBlipSprite(blip, 436)
			SetBlipDisplay(blip, 4)
			SetBlipScale(blip, 1.0)
			SetBlipColour(blip, 49)
			SetBlipAsShortRange(blip, true)
			BeginTextCommandSetBlipName("STRING")
			AddTextComponentString("Pacanele")
			EndTextCommandSetBlipName(blip)
		end
	end
end

function KeyboardInput(textEntry, inputText, maxLength)
    AddTextEntry('FMMC_KEY_TIP1', textEntry)
    DisplayOnscreenKeyboard(1, "FMMC_KEY_TIP1", "", inputText, "", "", "", maxLength)

    while UpdateOnscreenKeyboard() ~= 1 and UpdateOnscreenKeyboard() ~= 2 do
        Citizen.Wait(0)
    end

    if UpdateOnscreenKeyboard() ~= 2 then
        local result = GetOnscreenKeyboardResult()
        Citizen.Wait(500)
        return result
    else
        Citizen.Wait(500)
        return nil
    end
end

-------------------------------------------------------------------------------
-- NET EVENTS
-------------------------------------------------------------------------------
RegisterNetEvent("esx_slots:enterBets")
AddEventHandler("esx_slots:enterBets", function ()
    local bets = KeyboardInput("Geben sie ihren wetteinsatz:", "", Config.MaxBetNumbers)
    if tonumber(bets) ~= nil then
    	TriggerServerEvent('esx_slots:BetsAndMoney', tonumber(bets))
    else
    	TriggerEvent('esx:showNotification', "Sie müssen eine Grade zahl eingeben (500, 550, 1000, 1250...)")
    end
end)

RegisterNetEvent("esx_slots:UpdateSlots")
AddEventHandler("esx_slots:UpdateSlots", function(lei)
	SetNuiFocus(true, true)
	open = true
	SendNUIMessage({
		showSlotMachine = "open",
		coinAmount = tonumber(lei)
	})
end)

-------------------------------------------------------------------------------
-- NUI CALLBACKS
-------------------------------------------------------------------------------
RegisterNUICallback('exitWith', function(data, cb)
	cb('ok')
	SetNuiFocus(false, false)
	open = false
	TriggerServerEvent("esx_slots:PayOutRewards", data.payOut, data.payIn)
end)

-------------------------------------------------------------------------------
-- THREADS
-------------------------------------------------------------------------------
Citizen.CreateThread(function ()
	SetNuiFocus(false, false)
	open = false

	local wTime = 500
	local x = 1
	while true do
		Citizen.Wait(wTime)
		langaAparat = false

		for i=1, #Config.Slots, 1 do
			if GetDistanceBetweenCoords(GetEntityCoords(PlayerPedId()), Config.Slots[i].x, Config.Slots[i].y, Config.Slots[i].z, true) < 2  then
				x = i
				wTime = 0
				langaAparat = true
				ESX.ShowHelpNotification('Drücke ~INPUT_PICKUP~ um zu spielen')
			elseif GetDistanceBetweenCoords(GetEntityCoords(PlayerPedId()), Config.Slots[x].x, Config.Slots[x].y, Config.Slots[x].z, true) > 4 then
				wTime = 500
			end
		end
	end
end)

Citizen.CreateThread(function ()
	while true do
		Citizen.Wait(1)
		if open then
			DisableControlAction(0, 1, true) -- LookLeftRight
			DisableControlAction(0, 2, true) -- LookUpDown
			DisableControlAction(0, 24, true) -- Attack
			DisablePlayerFiring(PlayerPedId(), true) -- Disable weapon firing
			DisableControlAction(0, 142, true) -- MeleeAttackAlternate
			DisableControlAction(0, 106, true) -- VehicleMouseControlOverride
		elseif IsControlJustReleased(0, 38) and langaAparat then
			TriggerEvent('esx_slots:enterBets')
		end
	end
end)
